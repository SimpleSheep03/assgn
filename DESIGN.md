# Design Decisions and Architecture

## Overview

This is a call scheduling and management system built to integrate with a mock Call API. The system allows users to schedule calls for future times and automatically executes them when the scheduled time arrives.

## Tech Stack

### Backend Options

**Node.js Backend** (Recommended):
- **Express**: Simple, lightweight web framework
- **better-sqlite3**: Fast, synchronous SQLite driver
- **node-cron**: Popular cron library for Node.js
- **axios**: HTTP client for API calls

**Python Backend**:
- **Flask**: Simple, lightweight web framework
- **SQLAlchemy**: ORM for database operations - clean code, type safety
- **APScheduler**: Python library for cron jobs - clean API, easy to understand

### Database
- **SQLite**: Embedded database - no separate server needed, perfect for minimal setup

### Frontend
- **React**: Modern, component-based UI framework
- **No state management library**: Keep it simple - using React hooks for state
- **Plain CSS**: No CSS framework to keep it minimal and understandable

## Architecture Decisions

### 1. Database Choice: SQLite

**Why SQLite?**
- No separate database server required
- Single file database - easy to backup and understand
- Perfect for small to medium applications
- Zero configuration

**Trade-off**: Not ideal for high-concurrency production, but perfect for this use case.

### 2. Cron Job System

**Node.js Implementation (node-cron):**
- Node.js-native, no external cron service needed
- Runs in the same process as the Express app
- Easy to configure with cron syntax
- Can be paused/stopped programmatically

**Python Implementation (APScheduler):**
- Python-native, no external cron service needed
- Runs in the same process as the Flask app
- Easy to configure and understand
- Can be paused/stopped programmatically

**How it works:**
- Runs every 10 seconds (configurable)
- Checks for scheduled calls where `scheduled_time <= now` and `status = 'pending'`
- Executes calls by calling the Mock Call API
- Updates status in database

**Trade-off**: 10-second polling interval means calls execute within 10 seconds of scheduled time (not exact). For exact timing, would need more frequent polling or event-based system.

### 3. API Design

**RESTful endpoints:**
- `POST /api/scheduled-calls` - Create scheduled call
- `GET /api/scheduled-calls` - List all scheduled calls
- `DELETE /api/scheduled-calls/<id>` - Delete scheduled call
- `GET /api/call-history` - Get executed calls

**Why this design?**
- Standard REST conventions
- Easy to understand and test
- Frontend can easily consume

### 4. Status Tracking

**Two-table approach:**
1. **scheduled_calls**: Future calls that haven't executed yet
2. **call_history**: Calls that have been executed

**Why separate tables?**
- Clear separation of concerns
- Scheduled calls can be deleted/cancelled easily
- History is preserved even if scheduled call is deleted
- Better query performance

### 5. Call Status Updates

**Hybrid approach:**
- When cron job executes a call, it gets initial status from Call API
- Call history stores this status
- Frontend polls Call API to get real-time status updates

**Why?**
- Call API status changes over time (initiated → ringing → connected → completed)
- Storing final status only would miss intermediate states
- Polling on frontend provides real-time updates without backend complexity

## Code Organization

### Backend Structure

**Node.js Backend:**
```
backend-nodejs/
  server.js       # Main Express application and API endpoints
  database.js     # Database initialization and operations
  package.json    # Dependencies
```

**Python Backend:**
```
backend/
  app.py          # Main Flask application and API endpoints
  database.py     # Database models and initialization
  __init__.py     # Package initialization
```

**Why minimal?**
- Keep it simple and understandable
- All related code in one place
- Easy to navigate

### Frontend Structure
```
frontend/
  src/
    App.js              # Main app component with routing
    components/
      CallScheduler.js  # Form to schedule calls
      ScheduledCallsList.js  # List of scheduled calls
      CallHistory.js    # List of executed calls
```

**Why component-based?**
- Each feature is isolated
- Easy to understand and modify
- Follows React best practices

## Security Considerations

**For this assignment:**
- Basic input validation (phone number format, future dates)
- CORS enabled for frontend access
- SQL injection protection via SQLAlchemy ORM

**For production:**
- Would add authentication/authorization
- Rate limiting
- Input sanitization
- HTTPS
- Database connection pooling

## Performance Considerations

**Current implementation:**
- SQLite is fast for small datasets
- Cron job runs every 10 seconds (low overhead)
- Frontend polls every 3-5 seconds (reasonable for demo)

**For production:**
- Would use PostgreSQL/MySQL for concurrent access
- Use WebSockets for real-time updates instead of polling
- Add caching for frequently accessed data
- Background job queue (Celery) for scalability

## Error Handling

**Current approach:**
- Try-catch blocks around critical operations
- Database rollback on errors
- User-friendly error messages
- Console logging for debugging

**Why this level?**
- Sufficient for assignment scope
- Clear error messages help debugging
- Doesn't overcomplicate code

## Future Enhancements (Not Implemented)

1. **Authentication**: User accounts and sessions
2. **Call Templates**: Save common numbers
3. **Recurring Calls**: Daily/weekly schedules
4. **Notifications**: Email/SMS when calls execute
5. **Analytics**: Call statistics and reports
6. **Webhooks**: Real-time status updates
7. **Call Recording**: Store call metadata

These were omitted to keep the solution focused and minimal for the assignment.

## Conclusion

The architecture prioritizes:
- **Simplicity**: Easy to understand and explain
- **Minimalism**: Only essential features and dependencies
- **Maintainability**: Clean code structure
- **Demonstrability**: Shows key concepts (scheduling, cron jobs, API integration)

This makes it perfect for explaining during an interview while demonstrating solid engineering practices.

