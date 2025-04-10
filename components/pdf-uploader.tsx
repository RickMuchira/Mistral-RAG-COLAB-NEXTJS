"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, Check, X, Loader2, AlertCircle } from "lucide-react"
import { uploadPdfs } from "@/app/api/client" // Import our API client

export function PdfUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "success" | "error" | "uploading" }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Handle both drag and drop and file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')
      )
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      setErrorMessage(null)
    }
  }

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')
      )
      
      if (newFiles.length === 0) {
        setErrorMessage("Only PDF files are accepted.")
        return
      }
      
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      setErrorMessage(null)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMessage("Please select at least one PDF file to upload.")
      return
    }

    setUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    // Create a new status object with all files set to 'uploading'
    const newStatus: { [key: string]: "success" | "error" | "uploading" } = {}
    files.forEach((file) => {
      newStatus[file.name] = "uploading"
    })
    setUploadStatus(newStatus)

    try {
      // Use our API client to upload the files
      const result = await uploadPdfs(files)
      
      // Update all files to success
      const successStatus: { [key: string]: "success" | "error" | "uploading" } = {}
      files.forEach((file) => {
        successStatus[file.name] = "success"
      })
      setUploadStatus(successStatus)
      
      setSuccessMessage(result.message || "Files uploaded successfully")
      console.log(result.message)
    } catch (error) {
      // Update all files to error
      const errorStatus: { [key: string]: "success" | "error" | "uploading" } = {}
      files.forEach((file) => {
        errorStatus[file.name] = "error"
      })
      setUploadStatus(errorStatus)
      
      console.error("Error uploading files:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload files")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName))
    setUploadStatus((prev) => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
    
    // Clear error message if no files left
    if (files.length <= 1) {
      setErrorMessage(null)
    }
  }

  const clearAllFiles = () => {
    setFiles([])
    setUploadStatus({})
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileUp className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md w-full flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="whitespace-pre-line">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md w-full flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {files.length > 0 && (
            <div className="w-full mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFiles} 
                  disabled={uploading}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="text-sm truncate max-w-[70%]">{file.name}</span>
                    <div className="flex items-center">
                      {uploadStatus[file.name] === "uploading" && (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                      )}
                      {uploadStatus[file.name] === "success" && <Check className="h-5 w-5 text-green-500 mr-2" />}
                      {uploadStatus[file.name] === "error" && <X className="h-5 w-5 text-red-500 mr-2" />}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(file.name)} 
                        disabled={uploading}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleUpload} 
                disabled={uploading || files.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Files"
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}