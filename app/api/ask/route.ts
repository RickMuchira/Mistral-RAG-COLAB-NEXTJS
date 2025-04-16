// app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { askQuestion as askQuestionApi } from '@/app/api/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    const { question, courseId, yearId, semesterId, unitId } = body;
    
    console.log('Processing question:', question);
    console.log('Filters:', { courseId, yearId, semesterId, unitId });
    
    // Call the backend API with all filters
    try {
      const result = await askQuestionApi(
        question, 
        courseId ? Number(courseId) : undefined,
        yearId ? Number(yearId) : undefined,
        semesterId ? Number(semesterId) : undefined,
        unitId ? Number(unitId) : undefined
      );
      
      // Log result for debugging
      console.log('Backend response received:', {
        answerLength: result.answer?.length || 0,
        sourcesCount: result.sources?.length || 0
      });
      
      // Return the result
      return NextResponse.json(result);
      
    } catch (apiError) {
      console.error('Error calling backend API:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to process question with backend API', 
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing ask request:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}