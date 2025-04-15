'use client'
import type React from "react"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Edit, ChevronRight, Book, PenLine, School, BookOpen, FileText } from "lucide-react"
import { Course, Year, Semester, Unit } from '@/lib/models'

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [years, setYears] = useState<Year[]>([]);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showYearDialog, setShowYearDialog] = useState(false);
  const [showSemesterDialog, setShowSemesterDialog] = useState(false);
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  
  // Form state
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });
  const [yearForm, setYearForm] = useState({ name: '', year_number: '' });
  const [semesterForm, setSemesterForm] = useState({ name: '', semester_number: '' });
  const [unitForm, setUnitForm] = useState({ name: '', code: '', description: '' });
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);
  
  // Fetch years when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchYears(selectedCourse.id!);
    }
  }, [selectedCourse]);
  
  // Fetch semesters when a year is selected
  useEffect(() => {
    if (selectedYear) {
      fetchSemesters(selectedYear.id!);
    }
  }, [selectedYear]);
  
  // Fetch units when a semester is selected
  useEffect(() => {
    if (selectedSemester) {
      fetchUnits(selectedSemester.id!);
    }
  }, [selectedSemester]);
  
  // API functions
  async function fetchCourses() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      setCourses(data);
      
      // Reset selections when loading new courses
      setSelectedCourse(null);
      setSelectedYear(null);
      setSelectedSemester(null);
      setYears([]);
      setSemesters([]);
      setUnits([]);
    } catch (error) {
      setError('Error loading courses: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchYears(courseId: number) {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/years`);
      if (!response.ok) throw new Error('Failed to fetch years');
      
      const data = await response.json();
      setYears(data);
      
      // Reset year-related selections
      setSelectedYear(null);
      setSelectedSemester(null);
      setSemesters([]);
      setUnits([]);
    } catch (error) {
      setError('Error loading years: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchSemesters(yearId: number) {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/years/${yearId}/semesters`);
      if (!response.ok) throw new Error('Failed to fetch semesters');
      
      const data = await response.json();
      setSemesters(data);
      
      // Reset semester-related selections
      setSelectedSemester(null);
      setUnits([]);
    } catch (error) {
      setError('Error loading semesters: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function fetchUnits(semesterId: number) {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/semesters/${semesterId}/units`);
      if (!response.ok) throw new Error('Failed to fetch units');
      
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      setError('Error loading units: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  // Form submission handlers
  async function handleCreateCourse() {
    if (!courseForm.name) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      
      if (!response.ok) throw new Error('Failed to create course');
      
      // Close dialog and reset form
      setShowCourseDialog(false);
      setCourseForm({ name: '', description: '' });
      
      // Refresh courses
      fetchCourses();
    } catch (error) {
      setError('Error creating course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCreateYear() {
    if (!yearForm.name || !yearForm.year_number || !selectedCourse) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/years`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: yearForm.name,
          year_number: parseInt(yearForm.year_number)
        })
      });
      
      if (!response.ok) throw new Error('Failed to create year');
      
      // Close dialog and reset form
      setShowYearDialog(false);
      setYearForm({ name: '', year_number: '' });
      
      // Refresh years
      fetchYears(selectedCourse.id!);
    } catch (error) {
      setError('Error creating year: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCreateSemester() {
    if (!semesterForm.name || !semesterForm.semester_number || !selectedYear) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/years/${selectedYear.id}/semesters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: semesterForm.name,
          semester_number: parseInt(semesterForm.semester_number)
        })
      });
      
      if (!response.ok) throw new Error('Failed to create semester');
      
      // Close dialog and reset form
      setShowSemesterDialog(false);
      setSemesterForm({ name: '', semester_number: '' });
      
      // Refresh semesters
      fetchSemesters(selectedYear.id!);
    } catch (error) {
      setError('Error creating semester: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCreateUnit() {
    if (!unitForm.name || !unitForm.code || !selectedSemester) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/semesters/${selectedSemester.id}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm)
      });
      
      if (!response.ok) throw new Error('Failed to create unit');
      
      // Close dialog and reset form
      setShowUnitDialog(false);
      setUnitForm({ name: '', code: '', description: '' });
      
      // Refresh units
      fetchUnits(selectedSemester.id!);
    } catch (error) {
      setError('Error creating unit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  // Delete handlers
  async function handleDeleteCourse(courseId: number) {
    if (!confirm('Are you sure you want to delete this course? This will delete all associated years, semesters, units, and documents.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete course');
      
      // Refresh courses
      fetchCourses();
    } catch (error) {
      setError('Error deleting course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleDeleteYear(yearId: number) {
    if (!confirm('Are you sure you want to delete this year? This will delete all associated semesters, units, and documents.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/years/${yearId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete year');
      
      // Refresh years
      if (selectedCourse) {
        fetchYears(selectedCourse.id!);
      }
    } catch (error) {
      setError('Error deleting year: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleDeleteSemester(semesterId: number) {
    if (!confirm('Are you sure you want to delete this semester? This will delete all associated units and documents.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/semesters/${semesterId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete semester');
      
      // Refresh semesters
      if (selectedYear) {
        fetchSemesters(selectedYear.id!);
      }
    } catch (error) {
      setError('Error deleting semester: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleDeleteUnit(unitId: number) {
    if (!confirm('Are you sure you want to delete this unit? This will delete all associated documents.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete unit');
      
      // Refresh units
      if (selectedSemester) {
        fetchUnits(selectedSemester.id!);
      }
    } catch (error) {
      setError('Error deleting unit: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }
  
  // Add the JSX return statement for the component
  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Course Structure</h2>
        <Button onClick={() => setShowCourseDialog(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add Course
        </Button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      )}
      
      {!isLoading && (
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-4">
            {/* Course List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <Card key={course.id} className={`cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedCourse(course)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Book size={18} />
                      {course.name}
                    </CardTitle>
                    {course.description && <CardDescription>{course.description}</CardDescription>}
                  </CardHeader>
                  <CardFooter className="pt-2 flex justify-between">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id!) }}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCourse(course) }}>
                      <ChevronRight size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Show selected course and its years */}
            {selectedCourse && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <School size={20} />
                    {selectedCourse.name} - Years
                  </h3>
                  <Button onClick={() => setShowYearDialog(true)} className="flex items-center gap-2">
                    <Plus size={16} /> Add Year
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {years.map(year => (
                    <Card key={year.id} className={`cursor-pointer transition-all ${selectedYear?.id === year.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedYear(year)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <PenLine size={18} />
                          {year.name}
                        </CardTitle>
                        <CardDescription>Year {year.year_number}</CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteYear(year.id!) }}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedYear(year) }}>
                          <ChevronRight size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show selected year and its semesters */}
            {selectedYear && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen size={20} />
                    {selectedYear.name} - Semesters
                  </h3>
                  <Button onClick={() => setShowSemesterDialog(true)} className="flex items-center gap-2">
                    <Plus size={16} /> Add Semester
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semesters.map(semester => (
                    <Card key={semester.id} className={`cursor-pointer transition-all ${selectedSemester?.id === semester.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedSemester(semester)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen size={18} />
                          {semester.name}
                        </CardTitle>
                        <CardDescription>Semester {semester.semester_number}</CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteSemester(semester.id!) }}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSemester(semester) }}>
                          <ChevronRight size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show selected semester and its units */}
            {selectedSemester && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileText size={20} />
                    {selectedSemester.name} - Units
                  </h3>
                  <Button onClick={() => setShowUnitDialog(true)} className="flex items-center gap-2">
                    <Plus size={16} /> Add Unit
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map(unit => (
                    <Card key={unit.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText size={18} />
                          {unit.name}
                        </CardTitle>
                        <CardDescription>{unit.code}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {unit.description}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUnit(unit.id!)}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course to organize your academic content
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Brief description of the course"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={!courseForm.name || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Year Dialog */}
      <Dialog open={showYearDialog} onOpenChange={setShowYearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Year</DialogTitle>
            <DialogDescription>
              Create a new academic year for {selectedCourse?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="yearName">Year Name</Label>
              <Input
                id="yearName"
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                placeholder="e.g. First Year"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="yearNumber">Year Number</Label>
              <Input
                id="yearNumber"
                type="number"
                value={yearForm.year_number}
                onChange={(e) => setYearForm({ ...yearForm, year_number: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYearDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateYear} disabled={!yearForm.name || !yearForm.year_number || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Semester Dialog */}
      <Dialog open={showSemesterDialog} onOpenChange={setShowSemesterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Semester</DialogTitle>
            <DialogDescription>
              Create a new semester for {selectedYear?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="semesterName">Semester Name</Label>
              <Input
                id="semesterName"
                value={semesterForm.name}
                onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                placeholder="e.g. Fall Semester"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semesterNumber">Semester Number</Label>
              <Input
                id="semesterNumber"
                type="number"
                value={semesterForm.semester_number}
                onChange={(e) => setSemesterForm({ ...semesterForm, semester_number: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSemesterDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSemester} disabled={!semesterForm.name || !semesterForm.semester_number || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Semester
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Unit Dialog */}
      <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>
              Create a new unit for {selectedSemester?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="unitName">Unit Name</Label>
              <Input
                id="unitName"
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                placeholder="e.g. Introduction to Programming"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitCode">Unit Code</Label>
              <Input
                id="unitCode"
                value={unitForm.code}
                onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                placeholder="e.g. CS101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitDescription">Description (Optional)</Label>
              <Textarea
                id="unitDescription"
                value={unitForm.description}
                onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                placeholder="Brief description of the unit"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnitDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUnit} disabled={!unitForm.name || !unitForm.code || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}