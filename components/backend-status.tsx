//components/backend-status.tsx
"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { pingBackend } from "@/app/api/client"

interface BackendStatus {
  connected: boolean;
  documentCount: number;
  uniqueSources: number;
  error?: string;
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkBackendStatus()
  }, [])

  async function checkBackendStatus() {
    setIsChecking(true)
    try {
      // First, check if backend is reachable
      const connected = await pingBackend()
      
      if (!connected) {
        setStatus({
          connected: false,
          documentCount: 0,
          uniqueSources: 0,
          error: "Cannot connect to the backend API. The ngrok tunnel may have expired."
        })
        return
      }
      
      // Then fetch document stats
      const response = await fetch('/api/debug')
      
      if (response.ok) {
        const data = await response.json()
        setStatus({
          connected: true,
          documentCount: data.total_document_chunks || 0,
          uniqueSources: data.unique_sources?.length || 0
        })
      } else {
        setStatus({
          connected: true,
          documentCount: 0,
          uniqueSources: 0,
          error: "Connected to backend but couldn't fetch document information"
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        documentCount: 0,
        uniqueSources: 0,
        error: error instanceof Error ? error.message : "Unknown error checking backend status"
      })
    } finally {
      setIsChecking(false)
    }
  }

  if (!status) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Backend Status</AlertTitle>
        <AlertDescription>
          Verifying connection to the document processing backend...
        </AlertDescription>
      </Alert>
    )
  }

  if (!status.connected) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Unavailable</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>
            {status.error || "Cannot connect to the document processing backend. The ngrok tunnel may have expired."}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBackendStatus}
            disabled={isChecking}
            className="ml-2 bg-white hover:bg-gray-100"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (status.documentCount === 0) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-800" />
        <AlertTitle>No Documents Available</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>
            The system is connected but no documents have been uploaded yet. Please upload some PDFs before asking questions.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkBackendStatus}
            disabled={isChecking}
            className="ml-2 bg-white hover:bg-gray-100"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-800" />
      <AlertTitle>Backend Ready</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>
          Connected to the document processing backend. {status.documentCount} document chunks from {status.uniqueSources} files are available for searching.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkBackendStatus}
          disabled={isChecking}
          className="ml-2 bg-white hover:bg-gray-100"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </AlertDescription>
    </Alert>
  )
}