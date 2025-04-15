// lib/models.ts
import db from './db';

// Type definitions
export interface Course {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Year {
  id?: number;
  course_id: number;
  year_number: number;
  name: string;
  created_at?: string;
}

export interface Semester {
  id?: number;
  year_id: number;
  semester_number: number;
  name: string;
  created_at?: string;
}

export interface Unit {
  id?: number;
  semester_id: number;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Document {
  id?: number;
  unit_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  created_at?: string;
}

// Course operations
export const CourseModel = {
  // Create a new course
  create: (course: Course) => {
    const result = db.run(
      'INSERT INTO courses (name, description) VALUES (@name, @description)',
      course
    );
    return { ...course, id: result.lastInsertRowid };
  },

  // Get all courses
  getAll: () => {
    return db.query('SELECT * FROM courses ORDER BY name');
  },

  // Get a specific course by ID
  getById: (id: number) => {
    return db.get('SELECT * FROM courses WHERE id = @id', { id });
  },

  // Update a course
  update: (id: number, course: Partial<Course>) => {
    const result = db.run(
      'UPDATE courses SET name = @name, description = @description WHERE id = @id',
      { ...course, id }
    );
    return result.changes > 0;
  },

  // Delete a course
  delete: (id: number) => {
    const result = db.run('DELETE FROM courses WHERE id = @id', { id });
    return result.changes > 0;
  }
};

// Year operations
export const YearModel = {
  // Create a new year
  create: (year: Year) => {
    const result = db.run(
      'INSERT INTO years (course_id, year_number, name) VALUES (@course_id, @year_number, @name)',
      year
    );
    return { ...year, id: result.lastInsertRowid };
  },

  // Get all years for a course
  getAllByCourse: (courseId: number) => {
    return db.query(
      'SELECT * FROM years WHERE course_id = @courseId ORDER BY year_number',
      { courseId }
    );
  },

  // Get a specific year by ID
  getById: (id: number) => {
    return db.get('SELECT * FROM years WHERE id = @id', { id });
  },

  // Update a year
  update: (id: number, year: Partial<Year>) => {
    const result = db.run(
      'UPDATE years SET year_number = @year_number, name = @name WHERE id = @id',
      { ...year, id }
    );
    return result.changes > 0;
  },

  // Delete a year
  delete: (id: number) => {
    const result = db.run('DELETE FROM years WHERE id = @id', { id });
    return result.changes > 0;
  }
};

// Semester operations
export const SemesterModel = {
  // Create a new semester
  create: (semester: Semester) => {
    const result = db.run(
      'INSERT INTO semesters (year_id, semester_number, name) VALUES (@year_id, @semester_number, @name)',
      semester
    );
    return { ...semester, id: result.lastInsertRowid };
  },

  // Get all semesters for a year
  getAllByYear: (yearId: number) => {
    return db.query(
      'SELECT * FROM semesters WHERE year_id = @yearId ORDER BY semester_number',
      { yearId }
    );
  },

  // Get a specific semester by ID
  getById: (id: number) => {
    return db.get('SELECT * FROM semesters WHERE id = @id', { id });
  },

  // Update a semester
  update: (id: number, semester: Partial<Semester>) => {
    const result = db.run(
      'UPDATE semesters SET semester_number = @semester_number, name = @name WHERE id = @id',
      { ...semester, id }
    );
    return result.changes > 0;
  },

  // Delete a semester
  delete: (id: number) => {
    const result = db.run('DELETE FROM semesters WHERE id = @id', { id });
    return result.changes > 0;
  }
};

// Unit operations
export const UnitModel = {
  // Create a new unit
  create: (unit: Unit) => {
    const result = db.run(
      'INSERT INTO units (semester_id, code, name, description) VALUES (@semester_id, @code, @name, @description)',
      unit
    );
    return { ...unit, id: result.lastInsertRowid };
  },

  // Get all units for a semester
  getAllBySemester: (semesterId: number) => {
    return db.query(
      'SELECT * FROM units WHERE semester_id = @semesterId ORDER BY name',
      { semesterId }
    );
  },

  // Get a specific unit by ID
  getById: (id: number) => {
    return db.get('SELECT * FROM units WHERE id = @id', { id });
  },

  // Update a unit
  update: (id: number, unit: Partial<Unit>) => {
    const result = db.run(
      'UPDATE units SET code = @code, name = @name, description = @description WHERE id = @id',
      { ...unit, id }
    );
    return result.changes > 0;
  },

  // Delete a unit
  delete: (id: number) => {
    const result = db.run('DELETE FROM units WHERE id = @id', { id });
    return result.changes > 0;
  }
};

// Document operations
export const DocumentModel = {
  // Create a new document record
  create: (document: Document) => {
    const result = db.run(
      'INSERT INTO documents (unit_id, filename, original_filename, file_path) VALUES (@unit_id, @filename, @original_filename, @file_path)',
      document
    );
    return { ...document, id: result.lastInsertRowid };
  },

  // Get all documents for a unit
  getAllByUnit: (unitId: number) => {
    return db.query(
      'SELECT * FROM documents WHERE unit_id = @unitId ORDER BY created_at DESC',
      { unitId }
    );
  },

  // Get a specific document by ID
  getById: (id: number) => {
    return db.get('SELECT * FROM documents WHERE id = @id', { id });
  },

  // Delete a document
  delete: (id: number) => {
    const result = db.run('DELETE FROM documents WHERE id = @id', { id });
    return result.changes > 0;
  },

  // Get all documents with their full hierarchy info
  getAllWithHierarchy: () => {
    return db.query(`
      SELECT 
        d.id, d.filename, d.original_filename, d.file_path, d.created_at,
        u.id as unit_id, u.code as unit_code, u.name as unit_name,
        s.id as semester_id, s.name as semester_name, s.semester_number,
        y.id as year_id, y.name as year_name, y.year_number,
        c.id as course_id, c.name as course_name
      FROM 
        documents d
      JOIN 
        units u ON d.unit_id = u.id
      JOIN 
        semesters s ON u.semester_id = s.id
      JOIN 
        years y ON s.year_id = y.id
      JOIN 
        courses c ON y.course_id = c.id
      ORDER BY 
        d.created_at DESC
    `);
  },

  // Get all documents for a specific course
  getAllByCourse: (courseId: number) => {
    return db.query(`
      SELECT 
        d.id, d.filename, d.original_filename, d.file_path, d.created_at,
        u.id as unit_id, u.code as unit_code, u.name as unit_name,
        s.id as semester_id, s.name as semester_name, s.semester_number,
        y.id as year_id, y.name as year_name, y.year_number
      FROM 
        documents d
      JOIN 
        units u ON d.unit_id = u.id
      JOIN 
        semesters s ON u.semester_id = s.id
      JOIN 
        years y ON s.year_id = y.id
      WHERE 
        y.course_id = @courseId
      ORDER BY 
        d.created_at DESC
    `, { courseId });
  }
};