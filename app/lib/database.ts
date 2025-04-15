// lib/database.ts
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

class Database {
  private db: any;

  constructor() {
    this.init();
  }

  async init() {
    try {
      this.db = await open({
        filename: './courses.db',
        driver: sqlite3.Database
      });

      // Create tables if they don't exist
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async createTables() {
    // Courses table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        description TEXT,
        year INTEGER NOT NULL
      )
    `);

    // Semesters table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS semesters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Units table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        order_number INTEGER NOT NULL,
        semester_id TEXT NOT NULL,
        FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE
      )
    `);

    // Documents table
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        unit_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        document_type TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE
      )
    `);
  }

  // Generic query method
  async query(sql: string, params: any[] = []) {
    if (!this.db) {
      await this.init();
    }
    return this.db.all(sql, params);
  }

  // Generic run method for insert/update/delete
  async run(sql: string, params: any[] = []) {
    if (!this.db) {
      await this.init();
    }
    return this.db.run(sql, params);
  }
}

export const db = new Database();