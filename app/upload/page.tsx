"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatasetUploadForm } from "@/components/dataset-upload-form"
import { BatchPredictionResults } from "@/components/batch-prediction-results"

interface PredictionResult {
  row_number: number
  [key: string]: string | number | undefined
}

export default function UploadPage() {
  const [results, setResults] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [processingTime, setProcessingTime] = useState<number>(0)
  const [datasetSize, setDatasetSize] = useState<string>("")

  const handleUpload = async (file: File) => {
    const startTime = Date.now()
    setLoading(true)
    setError(null)
    setResults([])
    setFileName(file.name)
    setProgress(0)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    setDatasetSize(`${fileSizeMB}MB`)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/batch-predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process file")
      }

      const data = await response.json()
      setResults(data.predictions || [])
      setProgress(100)
      const endTime = Date.now()
      setProcessingTime((endTime - startTime) / 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const downloadResults = () => {
    if (results.length === 0) return

    const allKeys = new Set<string>()
    results.forEach((r) => {
      Object.keys(r).forEach((k) => allKeys.add(k))
    })

    const headers = Array.from(allKeys).sort()
    const csv = [headers, ...results.map((r) => headers.map((h) => r[h] ?? ""))]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sepsis-predictions-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SD</span>
            </div>
            <span className="font-semibold text-foreground">Sepsis Detection</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/predict" className="text-sm text-muted-foreground hover:text-foreground transition">
              Predict
            </Link>
            <Link href="/upload" className="text-sm text-foreground font-medium">
              Upload
            </Link>
            <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition">
              Compare
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Upload Dataset</h1>
        <p className="text-lg text-muted-foreground">
          Upload a CSV file with patient vital signs and lab values to get predictions from all three models. Supports
          datasets up to 20 lakh+ entries and 5GB file size.
        </p>
      </section>

      {/* Upload Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Select CSV File</h2>
              <DatasetUploadForm onUpload={handleUpload} loading={loading} />

              {/* Required Features */}
              <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Features Supported:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Supports 20 lakh+ entries</li>
                  <li>• Maximum 5GB file size</li>
                  <li>• Optimized processing</li>
                  <li>• Real-time statistics</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {error && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <Card className="p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Predictions</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {results.length} patients analyzed from {fileName} ({datasetSize})
                        {processingTime > 0 && ` - Processed in ${processingTime.toFixed(1)}s`}
                      </p>
                    </div>
                    <Button onClick={downloadResults} variant="outline" size="sm">
                      Download CSV
                    </Button>
                  </div>
                  <BatchPredictionResults results={results} />
                </Card>
              </div>
            )}

            {!results.length && !loading && !error && (
              <Card className="p-12 border border-dashed border-border bg-card/50 text-center">
                <div className="text-5xl mb-4">📤</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to upload</h3>
                <p className="text-muted-foreground">Upload large CSV files up to 5GB with 20 lakh+ entries</p>
              </Card>
            )}

            {loading && (
              <Card className="p-12 border border-border bg-card/50 text-center">
                <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Processing predictions...</h3>
                <p className="text-muted-foreground">Processing your 20 lakh+ dataset with all three models</p>
                {progress > 0 && (
                  <div className="mt-4 w-full bg-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>Sepsis Detection ML App | Built for academic and clinical research purposes</p>
        </div>
      </footer>
    </main>
  )
}
