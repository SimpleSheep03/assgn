/**
 * Call Scheduler Backend Server
 * Handles call scheduling, storage, and integration with Mock Call API
 */

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const { initDb, getDb } = require('./database');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const CALL_API_URL = 'http://localhost:5000';
const SCHEDULER_CHECK_INTERVAL = 10; // Check every 10 seconds

// Initialize database
const db = initDb();

/**
 * Cron job: Check for scheduled calls and execute them
 */
function checkAndExecuteScheduledCalls() {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Find scheduled calls that are due
    const scheduledCalls = db.prepare(`
      SELECT * FROM scheduled_calls 
      WHERE scheduled_time <= ? AND status = 'pending'
    `).all(now);
    
    scheduledCalls.forEach(scheduledCall => {
      try {
        // Call the Mock Call API
        axios.post(`${CALL_API_URL}/api/call`, {
          phone_number: scheduledCall.phone_number
        }, {
          timeout: 5000
        })
        .then(response => {
          if (response.status === 201) {
            const callData = response.data.call;
            const executedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            // Update scheduled call status
            db.prepare(`
              UPDATE scheduled_calls 
              SET status = 'executed', executed_at = ?, call_id = ?
              WHERE id = ?
            `).run(executedAt, callData.id, scheduledCall.id);
            
            // Create history record
            db.prepare(`
              INSERT INTO call_history (call_id, phone_number, status, scheduled_time, executed_at)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              callData.id,
              scheduledCall.phone_number,
              callData.status,
              scheduledCall.scheduled_time,
              executedAt
            );
            
            console.log(`✅ Executed scheduled call: ${scheduledCall.phone_number} at ${executedAt}`);
          } else {
            // Update status to failed
            db.prepare(`
              UPDATE scheduled_calls 
              SET status = 'failed', executed_at = ?
              WHERE id = ?
            `).run(new Date().toISOString().slice(0, 19).replace('T', ' '), scheduledCall.id);
            
            console.log(`❌ Failed to execute scheduled call: ${scheduledCall.phone_number}`);
          }
        })
        .catch(error => {
          console.log(`❌ Error executing scheduled call: ${error.message}`);
          
          // Update status to failed
          db.prepare(`
            UPDATE scheduled_calls 
            SET status = 'failed', executed_at = ?
            WHERE id = ?
          `).run(new Date().toISOString().slice(0, 19).replace('T', ' '), scheduledCall.id);
        });
      } catch (error) {
        console.log(`❌ Error executing scheduled call: ${error.message}`);
      }
    });
  } catch (error) {
    console.log(`❌ Error in cron job: ${error.message}`);
  }
}

// Schedule cron job to run every 10 seconds
cron.schedule('*/10 * * * * *', () => {
  checkAndExecuteScheduledCalls();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

/**
 * POST /api/scheduled-calls - Schedule a new call
 */
app.post('/api/scheduled-calls', (req, res) => {
  try {
    const { phone_number, scheduled_time } = req.body;
    
    // Validate required fields
    if (!phone_number || !scheduled_time) {
      return res.status(400).json({ error: 'phone_number and scheduled_time are required' });
    }
    
    // Validate phone number
    if (phone_number.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    // Parse scheduled time
    let scheduledTime;
    try {
      scheduledTime = new Date(scheduled_time.replace('Z', '+00:00'));
      if (isNaN(scheduledTime.getTime())) {
        throw new Error('Invalid date');
      }
      // Convert to ISO string without timezone for SQLite
      scheduledTime = scheduledTime.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
      return res.status(400).json({ error: `Invalid scheduled_time format: ${error.message}` });
    }
    
    // Validate scheduled time is in the future
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (scheduledTime <= now) {
      return res.status(400).json({ error: 'scheduled_time must be in the future' });
    }
    
    // Insert scheduled call
    const result = db.prepare(`
      INSERT INTO scheduled_calls (phone_number, scheduled_time, status)
      VALUES (?, ?, 'pending')
    `).run(phone_number, scheduledTime);
    
    const scheduledCall = db.prepare(`
      SELECT * FROM scheduled_calls WHERE id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      scheduled_call: {
        id: scheduledCall.id,
        phone_number: scheduledCall.phone_number,
        scheduled_time: new Date(scheduledCall.scheduled_time + 'Z').toISOString(),
        status: scheduledCall.status,
        created_at: new Date(scheduledCall.created_at + 'Z').toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating scheduled call:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scheduled-calls - Get all scheduled calls
 */
app.get('/api/scheduled-calls', (req, res) => {
  try {
    const scheduledCalls = db.prepare(`
      SELECT * FROM scheduled_calls 
      ORDER BY scheduled_time ASC
    `).all();
    
    const formattedCalls = scheduledCalls.map(call => ({
      id: call.id,
      phone_number: call.phone_number,
      scheduled_time: new Date(call.scheduled_time + 'Z').toISOString(),
      status: call.status,
      created_at: new Date(call.created_at + 'Z').toISOString(),
      executed_at: call.executed_at ? new Date(call.executed_at + 'Z').toISOString() : null,
      call_id: call.call_id
    }));
    
    res.json({
      success: true,
      scheduled_calls: formattedCalls
    });
  } catch (error) {
    console.error('Error fetching scheduled calls:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scheduled-calls/:id - Delete a scheduled call
 */
app.delete('/api/scheduled-calls/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if scheduled call exists
    const scheduledCall = db.prepare(`
      SELECT * FROM scheduled_calls WHERE id = ?
    `).get(id);
    
    if (!scheduledCall) {
      return res.status(404).json({ error: 'Scheduled call not found' });
    }
    
    // Delete scheduled call
    db.prepare(`
      DELETE FROM scheduled_calls WHERE id = ?
    `).run(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled call:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/call-history - Get call history (executed calls)
 */
app.get('/api/call-history', async (req, res) => {
  try {
    // Get call history
    const history = db.prepare(`
      SELECT * FROM call_history 
      ORDER BY executed_at DESC
    `).all();
    
    // Fetch current status from Call API for each call
    const callsWithStatus = await Promise.all(
      history.map(async (record) => {
        try {
          const response = await axios.get(
            `${CALL_API_URL}/api/call/${record.call_id}`,
            { timeout: 5000 }
          );
          
          if (response.status === 200) {
            const callData = response.data.call;
            return {
              id: record.id,
              call_id: record.call_id,
              phone_number: record.phone_number,
              status: callData.status,
              scheduled_time: new Date(record.scheduled_time + 'Z').toISOString(),
              executed_at: new Date(record.executed_at + 'Z').toISOString(),
              duration: callData.duration || null,
              created_at: callData.created_at || null,
              updated_at: callData.updated_at || null
            };
          } else {
            // Use stored status if API call fails
            return {
              id: record.id,
              call_id: record.call_id,
              phone_number: record.phone_number,
              status: record.status,
              scheduled_time: new Date(record.scheduled_time + 'Z').toISOString(),
              executed_at: new Date(record.executed_at + 'Z').toISOString(),
              duration: null,
              created_at: null,
              updated_at: null
            };
          }
        } catch (error) {
          console.log(`Error fetching call status: ${error.message}`);
          // Use stored status
          return {
            id: record.id,
            call_id: record.call_id,
            phone_number: record.phone_number,
            status: record.status,
            scheduled_time: new Date(record.scheduled_time + 'Z').toISOString(),
            executed_at: new Date(record.executed_at + 'Z').toISOString(),
            duration: null,
            created_at: null,
            updated_at: null
          };
        }
      })
    );
    
    res.json({
      success: true,
      calls: callsWithStatus
    });
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Call Scheduler Backend Starting...');
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log('Cron job checking every 10 seconds...');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});
