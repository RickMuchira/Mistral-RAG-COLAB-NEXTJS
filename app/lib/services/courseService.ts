// lib/services/courseService.ts
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database'

export interface Course {
  id?: string
  name: string
  code: string
  department: string
  description?: string
  year: number
}

export class CourseService {
  // Create a new course
  async createCourse(course: Course): Promise<Course> {
    const id = uuidv4()
    const { name, code, department, description, year } = course
    
    await db.run(
      `INSERT INTO courses 
      (id, name, code, department, description, year) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, code, department, description || null, year]
    )
    
    return { ...course, id }
  }

  // Get all courses
  async getCourses(options?: {
    limit?: number
    offset?: number
    search?: string
  }): Promise<Course[]> {
    let query = 'SELECT * FROM courses'
    const params: any[] = []

    if (options?.search) {
      query += ' WHERE name LIKE ? OR code LIKE ? OR department LIKE ?'
      const searchTerm = `%${options.search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (options?.limit) {
      query += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options?.offset) {
      query += ' OFFSET ?'
      params.push(options.offset)
    }

    return db.query(query, params)
  }

  // Get course by ID with full hierarchy
  async getCourseById(id: string): Promise<any> {
    // Fetch course with its semesters, units, and documents
    const course = await db.query(
      `SELECT c.*,
        (SELECT json_group_array(
          json_object(
            'id', s.id, 
            'name', s.name, 
            'year', s.year,
            'units', (
              SELECT json_group_array(
                json_object(
                  'id', u.id,
                  'name', u.name,
                  'description', u.description,
                  'order_number', u.order_number,
                  'documents', (
                    SELECT json_group_array(
                      json_object(
                        'id', d.id,
                        'fileName', d.file_name,
                        'filePath', d.file_path,
                        'uploadDate', d.upload_date,
                        'documentType', d.document_type
                      )
                    )
                    FROM documents d
                    WHERE d.unit_id = u.id
                  )
                )
              )
              FROM units u
              WHERE u.semester_id = s.id
            )
          )
        )
        FROM semesters s
        WHERE s.course_id = c.id
      ) AS semesters
      FROM courses c
      WHERE c.id = ?`,
      [id]
    )

    if (course.length === 0) return null

    // Parse the JSON in semesters column
    const fullCourse = course[0]
    fullCourse.semesters = JSON.parse(fullCourse.semesters || '[]')
    
    return fullCourse
  }

  // Update a course
  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
    const updateFields = Object.keys(courseData)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ')
    
    const values = Object.keys(courseData)
      .filter(key => key !== 'id')
      .map(key => courseData[key])
    
    values.push(id)

    await db.run(
      `UPDATE courses 
      SET ${updateFields} 
      WHERE id = ?`,
      values
    )

    return this.getCourseById(id)
  }

  // Delete a course
  async deleteCourse(id: string): Promise<boolean> {
    await db.run('DELETE FROM courses WHERE id = ?', [id])
    return true
  }
}

export const courseService = new CourseService()