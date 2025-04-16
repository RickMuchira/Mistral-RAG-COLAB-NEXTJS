// app/api/semesters/[id]/units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnitModel, Unit } from '@/lib/models';

// GET /api/semesters/[id]/units - Get all units for a semester
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure to await/handle params properly
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing semester ID' },
        { status: 400 }
      );
    }

    const semesterId = parseInt(id);
    if (isNaN(semesterId)) {
      return NextResponse.json(
        { error: 'Invalid semester ID' },
        { status: 400 }
      );
    }

    const units = UnitModel.getAllBySemester(semesterId);
    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}

// POST /api/semesters/[id]/units - Create a new unit for a semester
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure to await/handle params properly
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Missing semester ID' },
        { status: 400 }
      );
    }

    const semesterId = parseInt(id);
    if (isNaN(semesterId)) {
      return NextResponse.json(
        { error: 'Invalid semester ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }
    
    const unit: Unit = {
      semester_id: semesterId,
      code: body.code,
      name: body.name,
      description: body.description || '',
    };
    
    const newUnit = UnitModel.create(unit);
    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    );
  }
}