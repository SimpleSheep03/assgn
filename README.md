# Call Scheduler - Full Stack Application

A complete call scheduling and management system with React frontend and backend (Node.js or Python options).

## Architecture

Two backend implementations available:
- **Node.js Backend** (`backend-nodejs/`): Express with SQLite and node-cron (recommended)
- **Python Backend** (`backend/`): Flask with SQLite and APScheduler

**Frontend**: React application (runs on port 3000)  
**External API**: Mock Call API (provided, runs on port 5000)

## Quick Start

### Node.js Backend (Recommended)

See **SETUP-NODEJS.md** for detailed setup instructions.

1. **Start Mock Call API** (port 5000):
   ```bash
   pip install -r requirements.txt
   python api_server.py
   ```

2. **Start Backend Server** (port 5001):
   ```bash
   cd backend-nodejs
   npm install
   npm start
   ```

3. **Start Frontend** (port 3000):
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Python Backend

See **SETUP.md** for detailed setup instructions.

1. **Start Mock Call API** (port 5000):
   ```bash
   pip install -r requirements.txt
   python api_server.py
   ```

2. **Start Backend Server** (port 5001):
   ```bash
   cd backend
   python app.py
   ```

3. **Start Frontend** (port 3000):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Documentation

- **QUICKSTART.md** - Fastest way to get started
- **SETUP-NODEJS.md** - Detailed setup guide for Node.js backend
- **SETUP.md** - Detailed setup guide for Python backend
- **DESIGN.md** - Architecture decisions and design rationale
- **ASSIGNMENT.md** - Original assignment requirements
- **API_DOCUMENTATION.md** - Mock Call API documentation

## Features

- ✅ Schedule calls for future times
- ✅ Automatic execution via cron job (runs every 10 seconds)
- ✅ View scheduled calls and manage them
- ✅ View call history with real-time status updates
- ✅ Clean, minimalistic UI

## Tech Stack

**Node.js Backend**: Express, SQLite (better-sqlite3), node-cron, axios  
**Python Backend**: Flask, SQLite (SQLAlchemy), APScheduler  
**Frontend**: React  
**Database**: SQLite (embedded, no separate server needed)

## Testing the API

You can test the API before building:

```bash
# Initiate a call
curl -X POST http://localhost:5000/api/call \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890"}'

# Check status (use the ID from the response above)
curl http://localhost:5000/api/call/{call_id}
```

## Tips

- You're encouraged to use AI tools (Claude, ChatGPT, etc.)
- Start simple and iterate
- Focus on getting something working first
- The Call API will automatically progress call status over ~10 seconds

## Questions?

If anything is unclear about the assignment or API, please ask!

Good luck!
