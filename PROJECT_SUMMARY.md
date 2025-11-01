# Project File Summary

Complete overview of all files created and their purposes in the Call Scheduler application.

---

## 📁 Directory Structure

```
interview/
├── backend/              # Python/Flask backend implementation
├── backend-nodejs/       # Node.js/Express backend implementation
├── frontend/             # React frontend application
├── Documentation files   # Setup guides and design docs
└── Configuration files   # Dependencies and gitignore
```

---

## 🔧 Backend Implementation #1: Python/Flask

### `backend/app.py`
**Purpose**: Main Flask application server  
**Functionality**:
- RESTful API endpoints for call scheduling
- Integrates with Mock Call API (port 5000)
- Runs on port 5001
- APScheduler cron job (every 10 seconds) to execute scheduled calls
- Handles: POST/GET scheduled calls, DELETE, GET call history

### `backend/database.py`
**Purpose**: Database models and SQLite initialization  
**Functionality**:
- SQLAlchemy ORM models
- Two tables: `scheduled_calls`, `call_history`
- Database initialization on startup
- Session management for database operations

### `backend/__init__.py`
**Purpose**: Python package initialization  
**Functionality**: Makes `backend/` a proper Python package

**Dependencies** (from requirements.txt):
- Flask==3.0.0
- flask-cors==4.0.0
- requests==2.31.0
- APScheduler==3.10.4
- SQLAlchemy==2.0.23

---

## 🎨 Frontend: React Application

### `frontend/src/index.js`
**Purpose**: React application entry point  
**Functionality**: Renders App component into root div

### `frontend/src/index.css`
**Purpose**: Global styles  
**Functionality**: Base CSS reset and font imports

### `frontend/src/App.js`
**Purpose**: Main application component  
**Functionality**:
- Navigation tabs (Schedule, Scheduled, History)
- State management for active tab
- Renders appropriate component based on tab

### `frontend/src/App.css`
**Purpose**: App component styles  
**Functionality**:
- Header with gradient background
- Tab navigation styling
- Responsive layout

### `frontend/src/components/CallScheduler.js`
**Purpose**: Schedule call form component  
**Functionality**:
- Form to enter phone number and scheduled time
- Validation and error handling
- POST to `/api/scheduled-calls`
- Success/error messaging

### `frontend/src/components/CallScheduler.css`
**Purpose**: Styling for scheduling form  
**Functionality**: Card layout, form styling, buttons

### `frontend/src/components/ScheduledCallsList.js`
**Purpose**: Display all scheduled calls  
**Functionality**:
- Fetches all scheduled calls
- Auto-refreshes every 5 seconds
- Shows status badges (pending/executed/failed)
- Delete button for pending calls

### `frontend/src/components/ScheduledCallsList.css`
**Purpose**: Styling for scheduled calls table  
**Functionality**: Table design, badges, delete buttons

### `frontend/src/components/CallHistory.js`
**Purpose**: Display executed call history  
**Functionality**:
- Fetches call history
- Auto-refreshes every 3 seconds
- Shows real-time call status from Mock API
- Displays call duration when completed

### `frontend/src/components/CallHistory.css`
**Purpose**: Styling for call history table  
**Functionality**: Table design, status badges, responsive layout

### `frontend/public/index.html`
**Purpose**: HTML template  
**Functionality**: Root element for React app

### `frontend/package.json`
**Purpose**: React project configuration  
**Dependencies**:
- react: ^18.2.0
- react-dom: ^18.2.0
- react-scripts: ^5.0.1
**Proxy**: http://localhost:5001 (routes API calls to backend)

---

## 📚 Documentation Files

### `README.md`
**Purpose**: Project overview and quick start guide  
**Contents**:
- Project description
- Quick start instructions for both backends
- Links to documentation
- Features list
- Tech stack summary

### `QUICKSTART.md`
**Purpose**: Fastest way to get started  
**Contents**:
- Step-by-step setup for Node.js backend
- Step-by-step setup for Python backend
- What each service does
- Usage instructions

### `SETUP-NODEJS.md`
**Purpose**: Detailed setup guide for Node.js backend  
**Contents**:
- Architecture overview
- Prerequisites
- Setup instructions
- How it works
- Troubleshooting
- Design decisions

### `SETUP.md`
**Purpose**: Detailed setup guide for Python backend  
**Contents**:
- Same as above but for Python implementation
- Database schema details
- API endpoints documentation

### `DESIGN.md`
**Purpose**: Architecture and design decisions  
**Contents**:
- Tech stack comparison
- Database choice rationale
- Cron job system explanation
- API design decisions
- Security considerations
- Performance considerations
- Future enhancements

### `ASSIGNMENT.md`
**Purpose**: Original assignment requirements  
**Contents**: Assignment brief (not created by me, provided)

### `API_DOCUMENTATION.md`
**Purpose**: Mock Call API documentation  
**Contents**: API endpoint reference (not created by me, provided)

---

## 🔧 Configuration Files

### `.gitignore`
**Purpose**: Git ignore rules  
**Contents**:
- Python: `__pycache__`, `.pyc`, venv, `.db` files
- Node.js: `node_modules`, logs
- React: `node_modules`, `build`, logs
- IDE files
- OS files

### `requirements.txt`
**Purpose**: Python dependencies  
**Contents**:
- Flask, flask-cors, requests, APScheduler, SQLAlchemy

---

## 📊 API Endpoints Summary

### Backend API (Port 5001)
- `POST /api/scheduled-calls` - Create scheduled call
- `GET /api/scheduled-calls` - List all scheduled calls
- `DELETE /api/scheduled-calls/:id` - Delete scheduled call
- `GET /api/call-history` - Get executed call history
- `GET /health` - Health check

### Mock Call API (Port 5000)
- `POST /api/call` - Initiate call immediately
- `GET /api/call/:call_id` - Get call status

---

## 🗄️ Database Schema

### scheduled_calls
- `id` (INTEGER, PRIMARY KEY)
- `phone_number` (TEXT, NOT NULL)
- `scheduled_time` (DATETIME, NOT NULL)
- `status` (TEXT, DEFAULT 'pending')
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `executed_at` (DATETIME, NULLABLE)
- `call_id` (TEXT, NULLABLE)

### call_history
- `id` (INTEGER, PRIMARY KEY)
- `call_id` (TEXT, NOT NULL)
- `phone_number` (TEXT, NOT NULL)
- `status` (TEXT, DEFAULT 'initiated')
- `scheduled_time` (DATETIME, NOT NULL)
- `executed_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

---

## 🔄 Data Flow

1. **User schedules call** → Frontend → Backend API → Database
2. **Cron job** (every 10s) → Check database → Find due calls
3. **Execute call** → Backend → Mock Call API → Get response
4. **Update database** → Mark as executed/failed → Create history record
5. **Frontend polls** → Fetch history → Get status updates from Mock API

---

## 🎯 Key Features

✅ Schedule calls for future times  
✅ Automatic execution via cron (10-second intervals)  
✅ View scheduled calls with status  
✅ Delete pending scheduled calls  
✅ View call history with real-time status  
✅ Two backend implementations (Python & Node.js)  
✅ Clean, minimalistic UI  
✅ SQLite database (no separate server)  

---

## 🚀 How to Start

1. **Mock Call API** (port 5000): `python api_server.py`
2. **Backend** (port 5001): Choose Node.js or Python
3. **Frontend** (port 3000): `cd frontend && npm start`

Visit http://localhost:3000 to use the application!

