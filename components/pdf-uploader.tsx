"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, Check, X, Loader2, AlertCircle, ChevronDown } from "lucide-react"
import { uploadPdfs } from "@/app/api/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Define these types locally to avoid import errors
interface Course {
  id?: number;
  name: string;
  description?: string;
}

interface Year {
  id?: number;
  course_id: number;
  year_number: number;
  name: string;
}

interface Semester {
  id?: number;
  year_id: number;
  semester_number: number;
  name: string;
}

interface Unit {
  id?: number;
  semester_id: number;
  code: string;
  name: string;
  description?: string;
}

export function PdfUploader() {
  const searchParams = useSearchParams()
  const preselectedUnitId = searchParams.get('unitId')
  
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "success" | "error" | "uploading" }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Course structure state
  const [courses, setCourses] = useState<Course[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(preselectedUnitId)
  
  const [loadingStructure, setLoadingStructure] = useState(false)
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses()
  }, [])
  
  // Fetch years when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchYears(selectedCourseId)
    } else {
      setYears([])
      setSelectedYearId(null)
    }
  }, [selectedCourseId])
  
  // Fetch semesters when year is selected
  useEffect(() => {
    if (selectedYearId) {
      fetchSemesters(selectedYearId)
    } else {
      setSemesters([])
      setSelectedSemesterId(null)
    }
  }, [selectedYearId])
  
  // Fetch units when semester is selected
  useEffect(() => {
    if (selectedSemesterId) {
      fetchUnits(selectedSemesterId)
    } else {
      setUnits([])
      setSelectedUnitId(null)
    }
  }, [selectedSemesterId])
  
  // Fetch needed data if preselected unitId is provided
  useEffect(() => {
    if (preselectedUnitId) {
      fetchUnitHierarchy(preselectedUnitId)
    }
  }, [preselectedUnitId])
  
  // API functions for course structure
  async function fetchCourses() {
    setLoadingStructure(true)
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      setErrorMessage('Error loading courses: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }
  
  async function fetchYears(courseId: string) {
    setLoadingStructure(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/years`)
      if (!response.ok) throw new Error('Failed to fetch years')
      const data = await response.json()
      setYears(data)
    } catch (error) {
      setErrorMessage('Error loading years: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }
  
  async function fetchSemesters(yearId: string) {
    setLoadingStructure(true)
    try {
      const response = await fetch(`/api/years/${yearId}/semesters`)
      if (!response.ok) throw new Error('Failed to fetch semesters')
      const data = await response.json()
      setSemesters(data)
    } catch (error) {
      setErrorMessage('Error loading semesters: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }
  
  async function fetchUnits(semesterId: string) {
    setLoadingStructure(true)
    try {
      const response = await fetch(`/api/semesters/${semesterId}/units`)
      if (!response.ok) throw new Error('Failed to fetch units')
      const data = await response.json()
      setUnits(data)
    } catch (error) {
      setErrorMessage('Error loading units: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }
  
  // If a unit is preselected, fetch its full hierarchy (course, year, semester)
  async function fetchUnitHierarchy(unitId: string) {
    setLoadingStructure(true)
    try {
      // First, get the unit details
      const unitResponse = await fetch(`/api/units/${unitId}`)
      if (!unitResponse.ok) throw new Error('Failed to fetch unit details')
      const unit = await unitResponse.json()
      
      // Get semester details
      const semesterResponse = await fetch(`/api/semesters/${unit.semester_id}`)
      if (!semesterResponse.ok) throw new Error('Failed to fetch semester details')
      const semester = await semesterResponse.json()
      setSelectedSemesterId(semester.id.toString())
      
      // Get year details
      const yearResponse = await fetch(`/api/years/${semester.year_id}`)
      if (!yearResponse.ok) throw new Error('Failed to fetch year details')
      const year = await yearResponse.json()
      setSelectedYearId(year.id.toString())
      
      // Get course details and fetch dependencies
      setSelectedCourseId(year.course_id.toString())
      
      // Now fetch the lists at each level
      const coursesResponse = await fetch('/api/courses')
      if (!coursesResponse.ok) throw new Error('Failed to fetch courses')
      const courses = await coursesResponse.json()
      setCourses(courses)
      
      const yearsResponse = await fetch(`/api/courses/${year.course_id}/years`)
      if (!yearsResponse.ok) throw new Error('Failed to fetch years')
      const years = await yearsResponse.json()
      setYears(years)
      
      const semestersResponse = await fetch(`/api/years/${year.id}/semesters`)
      if (!semestersResponse.ok) throw new Error('Failed to fetch semesters')
      const semesters = await semestersResponse.json()
      setSemesters(semesters)
      
      const unitsResponse = await fetch(`/api/semesters/${semester.id}/units`)
      if (!unitsResponse.ok) throw new Error('Failed to fetch units')
      const units = await unitsResponse.json()
      setUnits(units)
      
      // Finally set the selected unit
      setSelectedUnitId(unitId)
    } catch (error) {
      setErrorMessage('Error loading unit hierarchy: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }
  
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
    
    if (!selectedUnitId) {
      setErrorMessage("Please select a unit to upload files to.")
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
      // Create FormData with files and unitId
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('unitId', selectedUnitId)
      
      // Send to our modified upload endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      
      // Update file status based on results
      const successStatus: { [key: string]: "success" | "error" | "uploading" } = {}
      const fileResults = result.results || []
      
      fileResults.forEach((fileResult: any) => {
        successStatus[fileResult.name] = fileResult.success ? "success" : "error"
      })
      
      setUploadStatus(successStatus)
      setSuccessMessage(result.message || "Files uploaded successfully")
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
    <div className="space-y-8">
      {/* Course structure selection */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Course Location</h3>
            <p className="text-sm text-gray-500">Choose where to upload your documents</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="course-select">Course</Label>
                <Select 
                  value={selectedCourseId || ""} 
                  onValueChange={setSelectedCourseId}
                  disabled={loadingStructure}
                >
                  <SelectTrigger id="course-select" className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id?.toString() || ""}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCourseId && (
                <div>
                  <Label htmlFor="year-select">Year</Label>
                  <Select 
                    value={selectedYearId || ""} 
                    onValueChange={setSelectedYearId}
                    disabled={loadingStructure || years.length === 0}
                  >
                    <SelectTrigger id="year-select" className="w-full">
                      <SelectValue placeholder="Select a year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.id} value={year.id?.toString() || ""}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {selectedYearId && (
                <div>
                  <Label htmlFor="semester-select">Semester</Label>
                  <Select 
                    value={selectedSemesterId || ""} 
                    onValueChange={setSelectedSemesterId}
                    disabled={loadingStructure || semesters.length === 0}
                  >
                    <SelectTrigger id="semester-select" className="w-full">
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester.id} value={semester.id?.toString() || ""}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {selectedSemesterId && (
                <div>
                  <Label htmlFor="unit-select">Unit</Label>
                  <Select 
                    value={selectedUnitId || ""} 
                    onValueChange={setSelectedUnitId}
                    disabled={loadingStructure || units.length === 0}
                  >
                    <SelectTrigger id="unit-select" className="w-full">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id?.toString() || ""}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {loadingStructure && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                  <span>Loading...</span>
                </div>
              )}
              
              {!selectedCourseId && !loadingStructure && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    Please select a course, year, semester, and unit to upload documents to.
                    If no options are available, please <a href="/course" className="underline">create your course structure</a> first.
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* File upload section */}
      <Card>
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
                disabled={uploading || !selectedUnitId}
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
                  disabled={uploading || files.length === 0 || !selectedUnitId}
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
    </div>
  )
}