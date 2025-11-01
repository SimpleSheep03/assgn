# Quick Start Guide

Choose between Node.js or Python backend - both work identically!

## Node.js Backend (Recommended)

### 1. Install Dependencies

```bash
# Backend
cd backend-nodejs
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Start Services

**Terminal 1 - Mock Call API:**
```bash
cd ..  # back to root
pip install -r requirements.txt
python api_server.py
```

**Terminal 2 - Backend:**
```bash
cd backend-nodejs
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

### 3. Open Browser
Visit: http://localhost:3000

---

## Python Backend

### 1. Install Dependencies

```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Start Services

**Terminal 1 - Mock Call API:**
```bash
python api_server.py
```

**Terminal 2 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

### 3. Open Browser
Visit: http://localhost:3000

---

## What Each Service Does

- **Mock Call API** (port 5000): Simulates Twilio-like call API
- **Backend** (port 5001): Schedules calls, runs cron job every 10 seconds
- **Frontend** (port 3000): React UI to schedule and view calls

## How to Use

1. **Schedule a Call**: Use the "Schedule Call" tab
2. **View Scheduled**: See pending calls
3. **View History**: See executed calls with real-time status updates

The cron job automatically executes calls when their scheduled time arrives!

