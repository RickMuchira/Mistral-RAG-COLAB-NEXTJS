// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CourseModel, Course } from '@/lib/models';

// GET /api/courses - Get all courses
export async function GET() {
  try {
    const courses = CourseModel.getAll();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const course: Course = {
      name: body.name,
      description: body.description || '',
    };
    
    const newCourse = CourseModel.create(course);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}