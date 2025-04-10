import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileUp, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Document Question Answering</h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload your PDF documents and ask questions to get AI-powered answers
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/upload">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <FileUp className="h-5 w-5" />
              Upload Documents
            </Button>
          </Link>
          <Link href="/ask">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <MessageSquare className="h-5 w-5" />
              Ask Questions
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
