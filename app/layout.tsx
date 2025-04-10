import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileUp, MessageSquare } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RAG Document System",
  description: "Upload documents and ask questions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container flex items-center justify-between h-16 mx-auto">
            <Link href="/" className="text-xl font-bold">
              DocumentAI
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/upload">
                <Button variant="outline" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Link href="/ask">
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask Questions
                </Button>
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
