"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, FileText, AlertCircle } from "lucide-react"
import { askQuestion as askQuestionApi, SourceInfo } from "@/app/api/client"

export function QuestionInterface() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<SourceInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{question: string, answer: string, sources: SourceInfo[]}>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer("")
    setSources([])
    setError(null)

    console.log("Submitting question:", question)

    try {
      // Use our API client to ask the question
      console.log("Calling askQuestionApi...")
      const result = await askQuestionApi(question)
      console.log("Received response:", result)
      
      // Check if we got a valid response
      if (!result) {
        console.error("Response is undefined or null")
        throw new Error("Received empty response from server")
      }

      // Check the answer field
      console.log("Answer field:", result.answer)
      
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

  return (
    <div className="space-y-6">
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