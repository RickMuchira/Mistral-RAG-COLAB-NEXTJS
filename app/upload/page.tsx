import { PdfUploader } from "@/components/pdf-uploader"

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Document Upload</h1>
        <p className="text-gray-600 mb-8 text-center">Upload PDF documents to your knowledge base</p>
        <PdfUploader />
      </div>
    </main>
  )
}
