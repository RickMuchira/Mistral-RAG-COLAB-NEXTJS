// app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

// Get backend API URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://8df9-34-127-119-159.ngrok-free.app';

export async function GET(request: NextRequest) {
  try {
    // Extract request parameters
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get('unitId');
    const courseId = searchParams.get('courseId');
    const yearId = searchParams.get('yearId');
    const semesterId = searchParams.get('semesterId');
    
    // Prepare request for the debug endpoint
    const url = new URL(`${API_BASE_URL}/debug`);
    
    // Add parameters if present
    if (unitId) url.searchParams.append('unitId', unitId);
    if (courseId) url.searchParams.append('courseId', courseId);
    if (yearId) url.searchParams.append('yearId', yearId);
    if (semesterId) url.searchParams.append('semesterId', semesterId);
    
    // Call the backend debug endpoint
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend responded with status ${response.status}` },
        { status: response.status }
      );
    }
    
    // Return the debug information
    const debugInfo = await response.json();
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information' },
      { status: 500 }
    );
  }
}