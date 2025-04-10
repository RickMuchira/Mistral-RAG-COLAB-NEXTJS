// app/api/client.ts

export interface SourceInfo {
    title: string;
    excerpt: string;
  }
  
  export interface AskResponse {
    answer: string;
    sources: SourceInfo[];
  }
  
  /**
   * Your ngrok Backend API URL
   * IMPORTANT: Replace this URL with the ngrok URL that is displayed in your Google Colab when you run the backend
   * It will look something like: https://xxxx-xxx-xxx-xxx-xxx.ngrok.io
   */
  const API_BASE_URL = 'https://fafa-34-19-104-99.ngrok-free.app';

  
  /**
   * Upload PDF files to the backend
   */
  export async function uploadPdfs(files: File[]): Promise<{ message: string }> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    try {
      console.log('Attempting to upload files to:', `${API_BASE_URL}/upload`);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          // Don't set Content-Type header for FormData - browser will set it with boundary
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            // If we can't get text either, use status
            errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  }
  
  /**
   * Ask a question about the uploaded documents
   */
  export async function askQuestion(question: string): Promise<AskResponse> {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process question');
    }
    
    return response.json();
  }