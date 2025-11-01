# Call Scheduler - Setup Guide

## Overview

This is a full-stack call scheduling application built with:
- **Backend**: Python/Flask with SQLite database and APScheduler for cron jobs
- **Frontend**: React
- **External API**: Mock Call API (provided, runs on port 5000)

## Architecture

- **Backend Server** (`backend/app.py`): Runs on port 5001, handles scheduling logic, database operations, and cron jobs
- **Database** (`backend/call_scheduler.db`): SQLite database storing scheduled calls and call history
- **Cron Job**: Runs every 10 seconds to check and execute scheduled calls
- **Frontend** (`frontend/`): React application running on port 3000

## Prerequisites

- Python 3.7+
- Node.js 14+ and npm
- The Mock Call API server (provided `api_server.py`)

## Setup Instructions

### 1. Start the Mock Call API Server

```bash
# In the root directory
pip install -r requirements.txt
python api_server.py
```

The Mock Call API will run on `http://localhost:5000`

### 2. Install Backend Dependencies

```bash
# Backend dependencies are already in requirements.txt
# If you haven't installed them yet:
pip install -r requirements.txt
```

### 3. Start the Backend Server

```bash
# From the root directory
cd backend
python app.py
# OR from root directory:
# python -m backend.app
```

The backend server will run on `http://localhost:5001`

**Note**: The database (`call_scheduler.db`) will be automatically created on first run.

### 4. Install and Start the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## How It Works

### Cron Job System

The backend uses **APScheduler** to run a cron job every 10 seconds that:
1. Checks for scheduled calls where `scheduled_time <= now` and `status = 'pending'`
2. Executes them by calling the Mock Call API
3. Updates the scheduled call status to 'executed' or 'failed'
4. Creates a history record for tracking

### Database Schema

- **scheduled_calls**: Stores calls to be scheduled
  - `id`, `phone_number`, `scheduled_time`, `status`, `created_at`, `executed_at`, `call_id`
  
- **call_history**: Stores executed calls
  - `id`, `call_id`, `phone_number`, `status`, `scheduled_time`, `executed_at`

### API Endpoints

**Backend API** (http://localhost:5001):

- `POST /api/scheduled-calls` - Schedule a new call
- `GET /api/scheduled-calls` - Get all scheduled calls
- `DELETE /api/scheduled-calls/<id>` - Delete a scheduled call
- `GET /api/call-history` - Get call history (executed calls)
- `GET /health` - Health check

**Mock Call API** (http://localhost:5000):

- `POST /api/call` - Initiate a call immediately
- `GET /api/call/<call_id>` - Get call status

## Usage

1. **Schedule a Call**: Use the "Schedule Call" tab to schedule a future call
2. **View Scheduled Calls**: Check the "Scheduled Calls" tab to see pending calls
3. **View History**: See executed calls and their statuses in the "Call History" tab

The cron job will automatically execute scheduled calls when their time arrives.

## Design Decisions

1. **SQLite Database**: Chosen for simplicity - no separate database server needed
2. **APScheduler**: Python library for cron jobs - easy to configure and understand
3. **Cron Interval**: 10 seconds - balances responsiveness with resource usage
4. **Status Tracking**: Calls are tracked from scheduled → executed → status updates from Call API
5. **Minimal Dependencies**: Only essential libraries to keep the codebase clean

## Troubleshooting

- **Backend won't start**: Make sure port 5001 is not in use
- **Frontend can't connect**: Ensure backend is running on port 5001
- **Calls not executing**: Check backend console logs for cron job errors
- **Database errors**: Delete `backend/call_scheduler.db` and restart the server

## Notes

- The cron job runs every 10 seconds, so scheduled calls may execute up to 10 seconds after their scheduled time
- Call statuses are automatically updated by polling the Call API when viewing history
- Scheduled calls can only be deleted if they haven't been executed yet

