/**
 * Database initialization and operations for Call Scheduler
 * Uses better-sqlite3 for SQLite database operations
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'call_scheduler.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 */
function initDb() {
  // Create scheduled_calls table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      scheduled_time DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      executed_at DATETIME,
      call_id TEXT
    )
  `);

  // Create call_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      status TEXT DEFAULT 'initiated',
      scheduled_time DATETIME NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized');
}

/**
 * Get database instance
 */
function getDb() {
  return db;
}

module.exports = {
  initDb,
  getDb
};

