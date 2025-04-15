// app/api/semesters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SemesterModel } from '@/lib/models';

// GET /api/semesters/[id] - Get a specific semester
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid semester ID' },
        { status: 400 }
      );
    }

    const semester = SemesterModel.getById(id);
    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error('Error fetching semester:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semester' },
      { status: 500 }
    );
  }
}

// PUT /api/semesters/[id] - Update a semester
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid semester ID' },
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
    
    const semester = {
      semester_number: body.semester_number,
      name: body.name,
    };
    
    const success = SemesterModel.update(id, semester);
    if (!success) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, ...semester });
  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json(
      { error: 'Failed to update semester' },
      { status: 500 }
    );
  }
}

// DELETE /api/semesters/[id] - Delete a semester
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid semester ID' },
        { status: 400 }
      );
    }

    const success = SemesterModel.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json(
      { error: 'Failed to delete semester' },
      { status: 500 }
    );
  }
}