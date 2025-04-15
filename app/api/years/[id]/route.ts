// app/api/years/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YearModel } from '@/lib/models';

// GET /api/years/[id] - Get a specific year
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid year ID' },
        { status: 400 }
      );
    }

    const year = YearModel.getById(id);
    if (!year) {
      return NextResponse.json(
        { error: 'Year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(year);
  } catch (error) {
    console.error('Error fetching year:', error);
    return NextResponse.json(
      { error: 'Failed to fetch year' },
      { status: 500 }
    );
  }
}

// PUT /api/years/[id] - Update a year
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid year ID' },
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
    
    const year = {
      year_number: body.year_number,
      name: body.name,
    };
    
    const success = YearModel.update(id, year);
    if (!success) {
      return NextResponse.json(
        { error: 'Year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, ...year });
  } catch (error) {
    console.error('Error updating year:', error);
    return NextResponse.json(
      { error: 'Failed to update year' },
      { status: 500 }
    );
  }
}

// DELETE /api/years/[id] - Delete a year
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid year ID' },
        { status: 400 }
      );
    }

    const success = YearModel.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Year not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting year:', error);
    return NextResponse.json(
      { error: 'Failed to delete year' },
      { status: 500 }
    );
  }
}