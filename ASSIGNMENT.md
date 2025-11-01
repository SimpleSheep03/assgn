# Call Scheduler - Full Stack Assignment

**Time Limit:** 1 hour
**Level:** Junior Developer

## Overview

Build a call scheduler and manager application. You'll integrate with a provided external Call API (similar to Twilio) that can initiate calls. Your job is to build everything else needed for a functional call scheduling system.

## What's Provided

A **Mock Call API** (external service) running on `http://localhost:5000` with two endpoints:

1. **POST** `/api/call` - Initiates a call immediately
   - Request: `{ "phone_number": "+1234567890" }`
   - Response: Call object with unique ID and status

2. **GET** `/api/call/{call_id}` - Get current call status
   - Response: Call status (initiated → ringing → connected → completed)

See `API_DOCUMENTATION.md` for complete details.

## What You Need to Build

A **call scheduler and manager** - interpret this however you think makes sense for users to schedule and manage their calls.

You'll need:
- A backend with scheduling logic and storage
- A frontend interface
- Integration with the provided Call API

## Technical Requirements

- Your application must integrate with the Call API at `http://localhost:5000`
- Your server must be separate from the provided Call API server
- Use any tech stack you're comfortable with
- Code should be clean and well-structured

## What We're Evaluating

1. **Code Quality & Structure** - Organization and readability
2. **API Integration Skills** - Working with external APIs
3. **Problem Solving** - What features you choose to implement and how
4. **Development Pace** - Functional solution in 1 hour

## Getting Started

1. Start the provided Call API server:
   ```bash
   cd interview_assignment
   pip install -r requirements.txt
   python api_server.py
   ```
   The Call API will run on `http://localhost:5000`

2. Create your own application in a separate directory
3. Build your solution
4. Integrate with `http://localhost:5000`

## Submission

Please provide:
1. Your complete source code
2. Instructions on how to run your application
3. Brief notes on your design decisions and trade-offs

Good luck!
