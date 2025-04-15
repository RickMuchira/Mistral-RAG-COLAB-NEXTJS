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
    const unit = UnitModel.getById(Number(unitId));'uuid'
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
          path: filePath
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

    // If we have a backend API for processing PDFs, we should call it here
    try {
      // Placeholder for calling your backend Colab notebook API
      // This would involve sending the saved files to your backend for processing
      
      // Example: You would modify this to call your API endpoint in the backend
      // For now, we're just logging that we would process these files
      console.log('Files saved and ready for backend processing:', savedFiles);
      
      return NextResponse.json({
        message: `Uploaded ${results.filter(r => r.success).length} files successfully.`,
        results
      });
      
    } catch (backendError) {
      console.error('Backend processing error:', backendError);
      
      // Return partial success - files were saved but processing may have failed
      return NextResponse.json({
        message: `Files uploaded but there was an error with backend processing.`,
        results,
        backendError: backendError instanceof Error ? backendError.message : 'Unknown error'
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}