'use client'
import { CourseManager } from '@/components/course-manager'

export default function CoursePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Course Management</h1>
        <p className="text-gray-600 mb-8 text-center">
          Create and manage your course structure for document organization
        </p>
        <CourseManager />
      </div>
    </main>
  )
}