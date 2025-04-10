import { QuestionInterface } from "@/components/question-interface"

export default function AskPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Ask Questions</h1>
        <p className="text-gray-600 mb-8 text-center">
          Get answers from your uploaded documents using AI
        </p>
        <QuestionInterface />
      </div>
    </main>
  )
}