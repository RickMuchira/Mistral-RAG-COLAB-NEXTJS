// app/api/years/[id]/semesters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SemesterModel, Semester } from '@/lib/models';

// GET /api/years/[id]/semesters - Get all semesters for a year
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const yearId = parseInt(params.id);
    if (isNaN(yearId)) {
      return NextResponse.json(
        { error: 'Invalid year ID' },
        { status: 400 }
      );
    }

    const semesters = SemesterModel.getAllByYear(yearId);
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semesters' },
      { status: 500 }
    );
  }
}

// POST /api/years/[id]/semesters - Create a new semester for a year
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const yearId = parseInt(params.id);
    if (isNaN(yearId)) {
      return NextResponse.json(
        { error: 'Invalid year ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.semester_number) {
      return NextResponse.json(
        { error: 'Name and semester_number are required' },
        { status: 400 }
      );
    }
    
    const semester: Semester = {
      year_id: yearId,
      semester_number: body.semester_number,
      name: body.name,
    };
    
    const newSemester = SemesterModel.create(semester);
    return NextResponse.json(newSemester, { status: 201 });
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json(
      { error: 'Failed to create semester' },
      { status: 500 }
    );
  }
}