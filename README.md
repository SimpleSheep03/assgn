# Call Scheduler - Coding Assignment

**Time Limit:** 1 hour

## Getting Started

### 1. Start the Mock Call API Server

This assignment includes a mock Call API (similar to Twilio) that you'll integrate with.

```bash
# Navigate to this directory
cd interview_assignment

# Install dependencies
pip install -r requirements.txt

# Start the server
python api_server.py
```

The Call API will run on `http://localhost:5000`

### 2. Read the Assignment

Open `ASSIGNMENT.md` for the full assignment details.

### 3. Read the API Documentation

Open `API_DOCUMENTATION.md` to understand the available endpoints.

## What's Provided

- **Mock Call API** - A working API server that can initiate calls and report status
- **API Documentation** - Complete endpoint reference
- **Assignment Brief** - What you need to build

## What You Need to Build

Everything else! See `ASSIGNMENT.md` for details.

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
