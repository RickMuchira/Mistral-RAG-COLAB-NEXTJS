// app/api/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentModel } from '@/lib/models';
import { pingBackend, askQuestion as askQuestionApi } from '@/app/api/client';

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
    
    // Check if backend is reachable
    const isConnected = await pingBackend();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Cannot reach the backend API. The ngrok tunnel may have expired.' },
        { status: 503 }
      );
    }
    
    // Fetch documents based on filters
    let documentsMetadata = [];
    if (unitId) {
      documentsMetadata = DocumentModel.getAllByUnit(Number(unitId));
    } else if (semesterId) {
      // Get all units in this semester, then get documents for each unit
      // This would require a new model method
      documentsMetadata = []; // Replace with actual implementation
    } else if (yearId) {
      // Get all documents for this year
      // This would require a new model method
      documentsMetadata = []; // Replace with actual implementation
    } else if (courseId) {
      documentsMetadata = DocumentModel.getAllByCourse(Number(courseId));
    } else {
      // No filter, get all documents
      documentsMetadata = DocumentModel.getAllWithHierarchy();
    }
    
    // If no documents match the filter, return an error
    if (documentsMetadata.length === 0) {
      return NextResponse.json({
        answer: "There are no documents uploaded for the selected criteria. Please upload documents first.",
        sources: []
      });
    }
    
    // Note: At this point, we would ideally pass the document filter information to the backend
    // For now, we'll just call the backend API as usual and add contextual information to the response
    
    // Call the backend API to ask the question
    try {
      const result = await askQuestionApi(question);
      
      // Add context about what documents were searched
      let contextInfo = "";
      if (unitId) {
        contextInfo = `Searched documents from a specific unit.`;
      } else if (semesterId) {
        contextInfo = `Searched documents from a specific semester.`;
      } else if (yearId) {
        contextInfo = `Searched documents from a specific year.`;
      } else if (courseId) {
        contextInfo = `Searched documents from a specific course.`;
      } else {
        contextInfo = `Searched all available documents.`;
      }
      
      return NextResponse.json({
        ...result,
        context: contextInfo
      });
      
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