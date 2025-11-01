"""
Call Scheduler Backend Server
Handles call scheduling, storage, and integration with Mock Call API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit
import sys
import os

# Handle imports when running from root or backend directory
if __name__ == '__main__':
    # When running directly, ensure we can import database
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

from database import init_db, get_db_session, ScheduledCall, CallHistory

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Configuration
CALL_API_URL = 'http://localhost:5000'
SCHEDULER_CHECK_INTERVAL = 10  # Check every 10 seconds

# Initialize database
init_db()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())


def check_and_execute_scheduled_calls():
    """Cron job: Check for scheduled calls and execute them"""
    session = get_db_session()
    try:
        now = datetime.now()
        # Find scheduled calls that are due
        scheduled_calls = session.query(ScheduledCall).filter(
            ScheduledCall.scheduled_time <= now,
            ScheduledCall.status == 'pending'
        ).all()
        
        for scheduled_call in scheduled_calls:
            try:
                # Call the Mock Call API
                response = requests.post(
                    f'{CALL_API_URL}/api/call',
                    json={'phone_number': scheduled_call.phone_number},
                    timeout=5
                )
                
                if response.status_code == 201:
                    call_data = response.json()['call']
                    # Update scheduled call status
                    scheduled_call.status = 'executed'
                    scheduled_call.executed_at = now
                    scheduled_call.call_id = call_data['id']
                    
                    # Create history record
                    history = CallHistory(
                        call_id=call_data['id'],
                        phone_number=scheduled_call.phone_number,
                        status=call_data['status'],
                        scheduled_time=scheduled_call.scheduled_time,
                        executed_at=now
                    )
                    session.add(history)
                    session.commit()
                    print(f"✅ Executed scheduled call: {scheduled_call.phone_number} at {now}")
                else:
                    scheduled_call.status = 'failed'
                    scheduled_call.executed_at = now
                    session.commit()
                    print(f"❌ Failed to execute scheduled call: {scheduled_call.phone_number}")
            except Exception as e:
                print(f"❌ Error executing scheduled call: {e}")
                scheduled_call.status = 'failed'
                scheduled_call.executed_at = now
                session.commit()
    except Exception as e:
        print(f"❌ Error in cron job: {e}")
    finally:
        session.close()


# Schedule cron job to run every 10 seconds
scheduler.add_job(
    func=check_and_execute_scheduled_calls,
    trigger=CronTrigger(second='*/10'),  # Every 10 seconds
    id='check_scheduled_calls',
    name='Check and execute scheduled calls',
    replace_existing=True
)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200


@app.route('/api/scheduled-calls', methods=['POST'])
def create_scheduled_call():
    """Schedule a new call"""
    data = request.get_json()
    
    if not data or 'phone_number' not in data or 'scheduled_time' not in data:
        return jsonify({'error': 'phone_number and scheduled_time are required'}), 400
    
    phone_number = data['phone_number']
    scheduled_time_str = data['scheduled_time']
    
    # Validate phone number
    if not phone_number or len(phone_number) < 10:
        return jsonify({'error': 'Invalid phone number'}), 400
    
    # Parse scheduled time
    try:
        scheduled_time = datetime.fromisoformat(scheduled_time_str.replace('Z', '+00:00'))
        # Convert to local time if needed
        if scheduled_time.tzinfo:
            scheduled_time = scheduled_time.replace(tzinfo=None)
    except Exception as e:
        return jsonify({'error': f'Invalid scheduled_time format: {e}'}), 400
    
    # Validate scheduled time is in the future
    if scheduled_time <= datetime.now():
        return jsonify({'error': 'scheduled_time must be in the future'}), 400
    
    session = get_db_session()
    try:
        scheduled_call = ScheduledCall(
            phone_number=phone_number,
            scheduled_time=scheduled_time,
            status='pending'
        )
        session.add(scheduled_call)
        session.commit()
        session.refresh(scheduled_call)
        
        return jsonify({
            'success': True,
            'scheduled_call': {
                'id': scheduled_call.id,
                'phone_number': scheduled_call.phone_number,
                'scheduled_time': scheduled_call.scheduled_time.isoformat(),
                'status': scheduled_call.status,
                'created_at': scheduled_call.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/scheduled-calls', methods=['GET'])
def get_scheduled_calls():
    """Get all scheduled calls"""
    session = get_db_session()
    try:
        scheduled_calls = session.query(ScheduledCall).order_by(
            ScheduledCall.scheduled_time.asc()
        ).all()
        
        return jsonify({
            'success': True,
            'scheduled_calls': [{
                'id': call.id,
                'phone_number': call.phone_number,
                'scheduled_time': call.scheduled_time.isoformat(),
                'status': call.status,
                'created_at': call.created_at.isoformat(),
                'executed_at': call.executed_at.isoformat() if call.executed_at else None,
                'call_id': call.call_id
            } for call in scheduled_calls]
        }), 200
    finally:
        session.close()


@app.route('/api/scheduled-calls/<int:call_id>', methods=['DELETE'])
def delete_scheduled_call(call_id):
    """Delete a scheduled call"""
    session = get_db_session()
    try:
        scheduled_call = session.query(ScheduledCall).filter(
            ScheduledCall.id == call_id
        ).first()
        
        if not scheduled_call:
            return jsonify({'error': 'Scheduled call not found'}), 404
        
        session.delete(scheduled_call)
        session.commit()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/call-history', methods=['GET'])
def get_call_history():
    """Get call history (executed calls)"""
    session = get_db_session()
    try:
        # Get call history
        history = session.query(CallHistory).order_by(
            CallHistory.executed_at.desc()
        ).all()
        
        # Fetch current status from Call API for each call
        calls_with_status = []
        for record in history:
            try:
                response = requests.get(
                    f'{CALL_API_URL}/api/call/{record.call_id}',
                    timeout=5
                )
                if response.status_code == 200:
                    call_data = response.json()['call']
                    calls_with_status.append({
                        'id': record.id,
                        'call_id': record.call_id,
                        'phone_number': record.phone_number,
                        'status': call_data['status'],
                        'scheduled_time': record.scheduled_time.isoformat(),
                        'executed_at': record.executed_at.isoformat(),
                        'duration': call_data.get('duration'),
                        'created_at': call_data.get('created_at'),
                        'updated_at': call_data.get('updated_at')
                    })
                else:
                    # Use stored status if API call fails
                    calls_with_status.append({
                        'id': record.id,
                        'call_id': record.call_id,
                        'phone_number': record.phone_number,
                        'status': record.status,
                        'scheduled_time': record.scheduled_time.isoformat(),
                        'executed_at': record.executed_at.isoformat(),
                        'duration': None,
                        'created_at': None,
                        'updated_at': None
                    })
            except Exception as e:
                print(f"Error fetching call status: {e}")
                # Use stored status
                calls_with_status.append({
                    'id': record.id,
                    'call_id': record.call_id,
                    'phone_number': record.phone_number,
                    'status': record.status,
                    'scheduled_time': record.scheduled_time.isoformat(),
                    'executed_at': record.executed_at.isoformat(),
                    'duration': None,
                    'created_at': None,
                    'updated_at': None
                })
        
        return jsonify({
            'success': True,
            'calls': calls_with_status
        }), 200
    finally:
        session.close()


if __name__ == '__main__':
    print("=" * 50)
    print("Call Scheduler Backend Starting...")
    print("Server running on: http://localhost:5001")
    print("Cron job checking every 10 seconds...")
    print("=" * 50)
    app.run(debug=True, port=5001, host='0.0.0.0')

