# Call Scheduler - Setup Guide (Node.js Backend)

## Overview

This is a full-stack call scheduling application built with:
- **Backend**: Node.js/Express with SQLite database and node-cron for cron jobs
- **Frontend**: React
- **External API**: Mock Call API (provided, runs on port 5000)

## Architecture

- **Backend Server** (`backend-nodejs/server.js`): Runs on port 5001, handles scheduling logic, database operations, and cron jobs
- **Database** (`backend-nodejs/call_scheduler.db`): SQLite database storing scheduled calls and call history
- **Cron Job**: Runs every 10 seconds to check and execute scheduled calls
- **Frontend** (`frontend/`): React application running on port 3000

## Prerequisites

- Node.js 14+ and npm
- Python 3.7+ (only for the Mock Call API)
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
# Navigate to backend-nodejs directory
cd backend-nodejs

# Install dependencies
npm install
```

### 3. Start the Backend Server

```bash
# From the backend-nodejs directory
npm start
# OR
node server.js
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

The backend uses **node-cron** to run a cron job every 10 seconds that:
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
- `DELETE /api/scheduled-calls/:id` - Delete a scheduled call
- `GET /api/call-history` - Get call history (executed calls)
- `GET /health` - Health check

**Mock Call API** (http://localhost:5000):

- `POST /api/call` - Initiate a call immediately
- `GET /api/call/:call_id` - Get call status

## Usage

1. **Schedule a Call**: Use the "Schedule Call" tab to schedule a future call
2. **View Scheduled Calls**: Check the "Scheduled Calls" tab to see pending calls
3. **View History**: See executed calls and their statuses in the "Call History" tab

The cron job will automatically execute scheduled calls when their time arrives.

## Design Decisions

1. **SQLite Database**: Chosen for simplicity - no separate database server needed
2. **better-sqlite3**: Synchronous SQLite driver for Node.js - fast and simple
3. **node-cron**: Popular cron library for Node.js - easy to configure
4. **Cron Interval**: 10 seconds - balances responsiveness with resource usage
5. **Status Tracking**: Calls are tracked from scheduled → executed → status updates from Call API
6. **Minimal Dependencies**: Only essential libraries to keep the codebase clean

## Troubleshooting

- **Backend won't start**: Make sure port 5001 is not in use
- **Frontend can't connect**: Ensure backend is running on port 5001
- **Calls not executing**: Check backend console logs for cron job errors
- **Database errors**: Delete `backend-nodejs/call_scheduler.db` and restart the server
- **npm install fails**: Make sure you have Node.js 14+ installed

## Notes

- The cron job runs every 10 seconds, so scheduled calls may execute up to 10 seconds after their scheduled time
- Call statuses are automatically updated by polling the Call API when viewing history
- Scheduled calls can only be deleted if they haven't been executed yet
- The backend uses synchronous database operations for simplicity (better-sqlite3)

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: SQLite with better-sqlite3
- **Cron**: node-cron
- **HTTP Client**: axios
- **Frontend**: React

