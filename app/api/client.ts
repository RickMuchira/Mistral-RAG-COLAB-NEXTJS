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
   * IMPORTANT: This URL needs to be updated when you restart your Colab
   */
  const API_BASE_URL = 'https://4240-34-125-10-173.ngrok-free.app';
  // Add a ping function to test connection
  export async function pingBackend(): Promise<boolean> {
    try {
      console.log('Testing backend connection to:', `${API_BASE_URL}/ping`);
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });
      
      console.log('Ping response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
  
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
      
      // First verify the backend is reachable
      const isConnected = await pingBackend();
      if (!isConnected) {
        throw new Error('Cannot reach the backend API. The ngrok tunnel may have expired.');
      }
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit', // Don't send cookies
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
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
    try {
      console.log('Sending question to backend:', question);
      
      // First verify the backend is reachable
      const isConnected = await pingBackend();
      if (!isConnected) {
        throw new Error('Cannot reach the backend API. The ngrok tunnel may have expired.');
      }
      
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit', // Don't send cookies
        body: JSON.stringify({ question }),
      });
      
      console.log('Ask response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to process question';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            errorMessage = `Question processing failed: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Question processing error:', error);
      throw error;
    }
  }