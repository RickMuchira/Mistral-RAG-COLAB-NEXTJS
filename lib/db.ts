// lib/db.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'course_rag.db');

// Create or open the database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize the database with our schema
function initializeDatabase() {
  const schema = `
    -- Courses table
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Years table
    CREATE TABLE IF NOT EXISTS years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      year_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Semesters table
    CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year_id INTEGER NOT NULL,
      semester_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE
    );

    -- Units table
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    );

    -- Documents table (to track uploaded PDFs)
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
    );
  `;

  db.exec(schema);
  console.log('Database schema initialized');
}

// Run initialization
initializeDatabase();

// Helper function to run SQLite queries with better error handling
function query(sql: string, params: any = {}) {
  try {
    return db.prepare(sql).all(params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function for get operations (returns a single row)
function get(sql: string, params: any = {}) {
  try {
    return db.prepare(sql).get(params);
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
}

// Helper function for insert/update/delete operations
function run(sql: string, params: any = {}) {
  try {
    return db.prepare(sql).run(params);
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
}

// Helper for executing transactions
function transaction(callback: (db: any) => void) {
  const runTransaction = db.transaction(callback);
  return runTransaction();
}

export default {
  db,
  query,
  get,
  run,
  transaction
};