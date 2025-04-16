//components/question-interface.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, FileText, AlertCircle, Filter } from "lucide-react"
import { SourceInfo } from "@/app/api/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BackendStatus } from "@/components/backend-status"

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

export function QuestionInterface() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<SourceInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{question: string, answer: string, sources: SourceInfo[]}>>([])
  
  // Course structure state
  const [courses, setCourses] = useState<Course[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  
  const [loadingStructure, setLoadingStructure] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [contextMessage, setContextMessage] = useState<string | null>(null)
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses()
  }, [])
  
  // Fetch years when course is selected
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== "all-courses") {
      fetchYears(selectedCourseId)
    } else {
      setYears([])
      setSelectedYearId(null)
    }
  }, [selectedCourseId])
  
  // Fetch semesters when year is selected
  useEffect(() => {
    if (selectedYearId && selectedYearId !== "all-years") {
      fetchSemesters(selectedYearId)
    } else {
      setSemesters([])
      setSelectedSemesterId(null)
    }
  }, [selectedYearId])
  
  // Fetch units when semester is selected
  useEffect(() => {
    if (selectedSemesterId && selectedSemesterId !== "all-semesters") {
      fetchUnits(selectedSemesterId)
    } else {
      setUnits([])
      setSelectedUnitId(null)
    }
  }, [selectedSemesterId])
  
  // API functions for course structure
  async function fetchCourses() {
    setLoadingStructure(true)
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      setError('Error loading courses: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
      setError('Error loading years: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
      setError('Error loading semesters: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
      setError('Error loading units: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingStructure(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer("")
    setSources([])
    setError(null)
    setContextMessage(null)

    console.log("Submitting question:", question)

    try {
      // Send question to our Next.js API with course filters
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          courseId: selectedCourseId !== "all-courses" ? selectedCourseId : undefined,
          yearId: selectedYearId !== "all-years" ? selectedYearId : undefined,
          semesterId: selectedSemesterId !== "all-semesters" ? selectedSemesterId : undefined,
          unitId: selectedUnitId !== "all-units" ? selectedUnitId : undefined
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process question")
      }
      
      const result = await response.json()
      
      // Check if we got a valid response
      if (!result) {
        console.error("Response is undefined or null")
        throw new Error("Received empty response from server")
      }

      // Check the answer field
      console.log("Answer field:", result.answer)
      
      // Set the context message if provided
      if (result.context) {
        setContextMessage(result.context)
      }
      
      // Save the current question and result
      const currentQA = {
        question: question,
        answer: result.answer || "No answer received",
        sources: result.sources && Array.isArray(result.sources) ? result.sources : []
      }
      
      setAnswer(result.answer || "No answer received")
      
      // Set sources if they're available
      if (result.sources && Array.isArray(result.sources)) {
        console.log("Setting sources:", result.sources)
        setSources(result.sources)
      } else {
        console.log("No valid sources in response")
      }
      
      // Add to history
      setHistory(prev => [currentQA, ...prev])
      
    } catch (error) {
      console.error("Error asking question (full details):", error)
      setError(error instanceof Error ? error.message : "Failed to process question")
      setAnswer("Sorry, there was an error processing your question. Please try again.")
    } finally {
      setIsLoading(false)
      console.log("Request completed, loading state reset")
    }
  }
  
  // Function to try a sample question
  const tryExampleQuestion = (exampleQuestion: string) => {
    setQuestion(exampleQuestion)
    // Auto-submit the form with the example question
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  }
  
  // Get a human-readable description of the current filter
  const getFilterDescription = () => {
    if (!selectedCourseId || selectedCourseId === "all-courses") return "All documents"
    
    const course = courses.find(c => c.id?.toString() === selectedCourseId)
    if (!selectedYearId || selectedYearId === "all-years") return `All documents in ${course?.name || 'the selected course'}`
    
    const year = years.find(y => y.id?.toString() === selectedYearId)
    if (!selectedSemesterId || selectedSemesterId === "all-semesters") return `All documents in ${year?.name || 'the selected year'}`
    
    const semester = semesters.find(s => s.id?.toString() === selectedSemesterId)
    if (!selectedUnitId || selectedUnitId === "all-units") return `All documents in ${semester?.name || 'the selected semester'}`
    
    const unit = units.find(u => u.id?.toString() === selectedUnitId)
    return `Documents in ${unit?.name || 'the selected unit'}`
  }

  return (
    <div className="space-y-6">
      {/* Backend Status Indicator */}
      <BackendStatus />
      
      {/* Course structure filters */}
      <div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        
        {showFilters && (
          <Card className="mb-4">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Filter documents by course structure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="course-select">Course</Label>
                  <Select 
                    value={selectedCourseId || "all-courses"} 
                    onValueChange={val => setSelectedCourseId(val)}
                    disabled={loadingStructure}
                  >
                    <SelectTrigger id="course-select" className="w-full">
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-courses">All courses</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id?.toString() || ""}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCourseId && selectedCourseId !== "all-courses" && (
                  <div>
                    <Label htmlFor="year-select">Year</Label>
                    <Select 
                      value={selectedYearId || "all-years"} 
                      onValueChange={val => setSelectedYearId(val)}
                      disabled={loadingStructure || years.length === 0}
                    >
                      <SelectTrigger id="year-select" className="w-full">
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">All years</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year.id} value={year.id?.toString() || ""}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedYearId && selectedYearId !== "all-years" && (
                  <div>
                    <Label htmlFor="semester-select">Semester</Label>
                    <Select 
                      value={selectedSemesterId || "all-semesters"} 
                      onValueChange={val => setSelectedSemesterId(val)}
                      disabled={loadingStructure || semesters.length === 0}
                    >
                      <SelectTrigger id="semester-select" className="w-full">
                        <SelectValue placeholder="All semesters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-semesters">All semesters</SelectItem>
                        {semesters.map(semester => (
                          <SelectItem key={semester.id} value={semester.id?.toString() || ""}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedSemesterId && selectedSemesterId !== "all-semesters" && (
                  <div>
                    <Label htmlFor="unit-select">Unit</Label>
                    <Select 
                      value={selectedUnitId || "all-units"} 
                      onValueChange={val => setSelectedUnitId(val)}
                      disabled={loadingStructure || units.length === 0}
                    >
                      <SelectTrigger id="unit-select" className="w-full">
                        <SelectValue placeholder="All units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-units">All units</SelectItem>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id?.toString() || ""}>
                            {unit.code} - {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {loadingStructure && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              )}
              
              <div className="text-sm font-medium text-gray-500">
                Currently searching: {getFilterDescription()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex w-full space-x-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !question.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Ask
            </>
          )}
        </Button>
      </form>

      {/* Example questions section */}
      <div className="text-sm text-gray-500">
        <p>Try asking:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {["What are the main topics in my documents?", 
            "Can you summarize the key points?", 
            "What evidence supports the main argument?"].map((example, i) => (
            <button
              key={i}
              onClick={() => tryExampleQuestion(example)}
              className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {(answer || isLoading) && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Searching documents and generating answer...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Answer</h3>
                  <div className="text-gray-700 whitespace-pre-line p-4 bg-gray-50 rounded-md">{answer}</div>
                </div>
                
                {contextMessage && (
                  <div className="text-sm text-gray-500 italic">
                    {contextMessage}
                  </div>
                )}

                {sources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sources</h3>
                    <div className="space-y-3">
                      {sources.map((source, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 mr-2" />
                            {source.title}
                          </div>
                          <p className="text-sm text-gray-600">{source.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Previous questions and answers */}
      {history.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Previous Questions</h3>
          <div className="space-y-6">
            {history.slice(1).map((item, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="pt-4">
                  <p className="font-medium text-gray-900 mb-2">Q: {item.question}</p>
                  <p className="text-gray-700 mb-2">A: {item.answer}</p>
                  {item.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">Sources:</p>
                      <ul className="text-xs text-gray-500 ml-4 list-disc">
                        {item.sources.map((source, i) => (
                          <li key={i}>{source.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}