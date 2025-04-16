// app/api/client.ts
export interface SourceInfo {
  title: string;
  excerpt: string;
}

export interface AskResponse {
  answer: string;
  sources: SourceInfo[];
  context?: string;
}

export interface UploadResult {
  message: string;
  results: Array<{
    name: string;
    success: boolean;
    error?: string;
    id?: number;
  }>;
  backendResult?: any;
  backendError?: string;
}

/**
 * Your ngrok Backend API URL
 * IMPORTANT: This URL needs to be updated when you restart your Colab
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://8df9-34-127-119-159.ngrok-free.app';

/**
 * Test connection to the backend service
 * Returns true if the backend is reachable, false otherwise
 */
export async function pingBackend(): Promise<boolean> {
  try {
    console.log('Testing backend connection to:', `${API_BASE_URL}/ping`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/ping`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Ping response status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}

/**
 * Extract meaningful error message from response
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;
  } catch (e) {
    try {
      const errorText = await response.text();
      return errorText || `Error ${response.status}: ${response.statusText}`;
    } catch (e2) {
      return `Error ${response.status}: ${response.statusText}`;
    }
  }
}

/**
 * Upload PDF files to the backend
 */
export async function uploadPdfs(files: File[], unitId: string): Promise<UploadResult> {
  const formData = new FormData();
  
  // Add each file to the form data
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  // Add unitId to the form data
  formData.append('unitId', unitId);
  
  try {
    // Check for connectivity before starting the upload process
    const isConnected = await pingBackend();
    if (!isConnected) {
      console.warn('Backend API is not reachable. Local upload will continue but processing may be delayed.');
    }
    
    // Upload to our local Next.js endpoint which will handle backend processing
    console.log('Uploading files via local endpoint with unitId:', unitId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for large uploads
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const errorMessage = await extractErrorMessage(response);
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    // Check for partial success (status 207)
    if (response.status === 207) {
      console.warn('Partial success - backend processing may have failed:', result.backendError);
    }
    
    return result;
  } catch (error) {
    console.error('Upload error details:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Upload timed out. The server may be experiencing high load or your files might be too large.');
    }
    
    throw error;
  }
}

/**
 * Ask a question about the uploaded documents
 */
export async function askQuestion(question: string, courseId?: number, yearId?: number, semesterId?: number, unitId?: number): Promise<AskResponse> {
  try {
    console.log('Sending question to backend:', question);
    
    // First verify the backend is reachable
    const isConnected = await pingBackend();
    if (!isConnected) {
      throw new Error('Cannot reach the backend API. The ngrok tunnel may have expired or the backend service is down.');
    }
    
    // Create request body with filtering parameters
    const requestBody: any = { question };
    if (courseId) requestBody.courseId = courseId;
    if (yearId) requestBody.yearId = yearId;
    if (semesterId) requestBody.semesterId = semesterId;
    if (unitId) requestBody.unitId = unitId;
    
    console.log('Request body:', requestBody);
    
    // Add timeout for long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for question processing
    
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit', // Don't send cookies
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Ask response status:', response.status);
    
    if (!response.ok) {
      const errorMessage = await extractErrorMessage(response);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Question processing error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The question might be too complex or the system is under heavy load.');
    }
    
    throw error;
  }
}