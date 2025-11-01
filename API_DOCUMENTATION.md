# Call API Documentation

Base URL: `http://localhost:5000`

## Endpoints

### 1. Initiate a Call

**POST** `/api/call`

Initiate a new call immediately.

**Request Body:**
```json
{
  "phone_number": "string (required, min 10 characters)"
}
```

**Example:**
```json
{
  "phone_number": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "call": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_number": "+1234567890",
    "status": "initiated",
    "created_at": "2025-11-01T14:00:00",
    "updated_at": "2025-11-01T14:00:00",
    "duration": null
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "phone_number is required"
}
```

---

### 2. Get Call Status

**GET** `/api/call/{call_id}`

Get the current status of a specific call.

**Response (200 OK):**
```json
{
  "success": true,
  "call": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_number": "+1234567890",
    "status": "connected",
    "created_at": "2025-11-01T14:00:00",
    "updated_at": "2025-11-01T14:00:05",
    "duration": null
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Call not found"
}
```

---

### 3. Health Check

**GET** `/health`

Check if the server is running.

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

## Call Status Lifecycle

When a call is initiated, it automatically progresses through these states:

1. **initiated** (immediately) → Call has started
2. **ringing** (after ~2 seconds) → Phone is ringing
3. **connected** (after ~5 seconds total) → Call is connected
4. **completed** (after ~10 seconds total) → Call has ended (duration: 10 seconds)

You can poll the `/api/call/{call_id}` endpoint to track status changes.
