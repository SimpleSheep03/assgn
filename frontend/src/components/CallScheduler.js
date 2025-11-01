import React, { useState } from 'react';
import './CallScheduler.css';

const CallScheduler = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !scheduledTime) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5001/api/scheduled-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          scheduled_time: scheduledTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Call scheduled successfully for ${new Date(scheduledTime).toLocaleString()}` 
        });
        setPhoneNumber('');
        setScheduledTime('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to schedule call' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  // Set minimum datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="call-scheduler">
      <div className="card">
        <h2>Schedule a Call</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduledTime">Scheduled Time</label>
            <input
              type="datetime-local"
              id="scheduledTime"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={minDateTime}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Scheduling...' : 'Schedule Call'}
          </button>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CallScheduler;

