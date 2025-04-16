// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentModel, UnitModel } from '@/lib/models';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Define storage directory
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get backend API URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://c6bf-34-143-191-121.ngrok-free.app';

// Type definitions to fix TS errors
interface UnitType {
  id: number;
  semester_id: number;
  code: string;
  name: string;
  description?: string;
}

interface SemesterType {
  id: number;
  year_id: number;
  semester_number: number;
  name: string;
}

interface YearType {
  id: number;
  course_id: number;
  year_number: number;
  name: string;
}

interface CourseType {
  id: number;
  name: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const unitId = formData.get('unitId');
    
    // Validate unitId
    if (!unitId || isNaN(Number(unitId))) {
      return NextResponse.json(
        { error: 'Invalid or missing unitId' },
        { status: 400 }
      );
    }
    
    // Verify the unit exists
    const unit = UnitModel.getById(Number(unitId)) as UnitType | null;
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const results = [];
    const savedFiles = [];

    // Generate a unit-specific directory
    const unitDir = path.join(uploadDir, `unit-${unitId}`);
    if (!fs.existsSync(unitDir)) {
      fs.mkdirSync(unitDir, { recursive: true });
    }

    // Attempt to fetch course hierarchy for metadata
    let courseHierarchy: Record<string, any> = {};
    try {
      // Get semester information
      const semesterId = unit.semester_id;
      const semesterResponse = await fetch(`/api/semesters/${semesterId}`);
      if (semesterResponse.ok) {
        const semester = await semesterResponse.json() as SemesterType;
        const yearId = semester.year_id;
        
        // Get year information
        const yearResponse = await fetch(`/api/years/${yearId}`);
        if (yearResponse.ok) {
          const year = await yearResponse.json() as YearType;
          const courseId = year.course_id;
          
          // Get course information
          const courseResponse = await fetch(`/api/courses/${courseId}`);
          if (courseResponse.ok) {
            const course = await courseResponse.json() as CourseType;
            
            // Build course hierarchy object
            courseHierarchy = {
              course_id: courseId,
              course_name: course.name,
              year_id: yearId,
              year_name: year.name,
              semester_id: semesterId,
              semester_name: semester.name,
              unit_id: unitId,
              unit_name: unit.name
            };
          }
        }
      }
    } catch (hierarchyError) {
      console.warn('Could not fetch complete course hierarchy:', hierarchyError);
      // Continue without full hierarchy - not a critical error
    }

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        results.push({
          name: file.name,
          success: false,
          error: 'Only PDF files are allowed'
        });
        continue;
      }

      try {
        // Generate a unique filename to avoid collisions
        const uniqueFilename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(unitDir, uniqueFilename);
        
        // Convert file to Buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        
        // Save file info to database
        const documentRecord = DocumentModel.create({
          unit_id: Number(unitId),
          filename: uniqueFilename,
          original_filename: file.name,
          file_path: filePath,
        });
        
        results.push({
          name: file.name,
          success: true,
          id: documentRecord.id
        });
        
        savedFiles.push({
          id: documentRecord.id,
          path: filePath,
          name: file.name
        });
      } catch (error) {
        console.error(`Error saving file ${file.name}:`, error);
        results.push({
          name: file.name,
          success: false,
          error: 'Failed to save file'
        });
      }
    }

    // If no files were successfully saved, return early
    if (savedFiles.length === 0) {
      return NextResponse.json({
        message: 'No files were successfully saved.',
        results
      }, { status: 400 });
    }

    // Send files to backend for processing
    try {
      console.log(`Sending files to backend at ${API_BASE_URL}/upload`);
      
      // Check backend connectivity first
      try {
        const pingResponse = await fetch(`${API_BASE_URL}/ping`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
          // Remove the 'timeout' property as it's not in RequestInit
        });
        
        if (!pingResponse.ok) {
          throw new Error(`Backend not reachable: ${pingResponse.status}`);
        }
        
        console.log('Backend ping successful');
      } catch (pingError) {
        console.error('Backend ping failed:', pingError);
        return NextResponse.json({
          message: `Files uploaded locally but backend is not available for processing. Please try again later.`,
          results,
          backendError: pingError instanceof Error ? pingError.message : 'Connection failed'
        }, { status: 207 });
      }
      
      // Create form data for backend upload
      const backendFormData = new FormData();
      
      // Add files to form data
      for (const savedFile of savedFiles) {
        // Read the file back from disk
        const fileBuffer = await fs.promises.readFile(savedFile.path);
        
        // Create blob and append to form data
        const fileBlob = new Blob([fileBuffer]);
        backendFormData.append('files', fileBlob, savedFile.name);
      }
      
      // Add unitId to the form
      backendFormData.append('unitId', unitId.toString());
      
      // Add course hierarchy metadata if available
      if (Object.keys(courseHierarchy).length > 0) {
        backendFormData.append('courseHierarchy', JSON.stringify(courseHierarchy));
      }
      
      // Send to backend for processing with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const backendResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: backendFormData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!backendResponse.ok) {
        throw new Error(`Backend upload failed: ${backendResponse.status}`);
      }
      
      const backendResult = await backendResponse.json();
      console.log('Backend processing result:', backendResult);
      
      return NextResponse.json({
        message: `Uploaded ${results.filter(r => r.success).length} files successfully. Backend processing: ${backendResult.message || 'Completed'}`,
        results,
        backendResult
      });
      
    } catch (backendError) {
      console.error('Backend processing error:', backendError);
      
      // Make sure we return a proper error message
      const errorMessage = backendError instanceof Error 
        ? backendError.message 
        : 'Unknown error during backend processing';
      
      return NextResponse.json({
        message: `Files uploaded locally but there was an error with backend processing: ${errorMessage}`,
        results,
        backendError: errorMessage
      }, { status: 207 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
}