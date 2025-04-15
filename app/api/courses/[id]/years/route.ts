// app/api/courses/[id]/years/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YearModel, Year } from '@/lib/models';

// GET /api/courses/[id]/years - Get all years for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const years = YearModel.getAllByCourse(courseId);
    return NextResponse.json(years);
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch years' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/years - Create a new year for a course
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.year_number) {
      return NextResponse.json(
        { error: 'Name and year_number are required' },
        { status: 400 }
      );
    }
    
    const year: Year = {
      course_id: courseId,
      year_number: body.year_number,
      name: body.name,
    };
    
    const newYear = YearModel.create(year);
    return NextResponse.json(newYear, { status: 201 });
  } catch (error) {
    console.error('Error creating year:', error);
    return NextResponse.json(
      { error: 'Failed to create year' },
      { status: 500 }
    );
  }
}