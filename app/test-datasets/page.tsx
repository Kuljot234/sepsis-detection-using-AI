"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatasetSelector } from "@/components/dataset-selector"
import { PredictionResultsTable } from "@/components/prediction-results-table"

interface PredictionResult {
  row_number: number
  [key: string]: string | number | undefined
}

interface Dataset {
  id: string
  name: string
  file: string
  rowCount: number
}

export default function TestDatasetsPage() {
  const [results, setResults] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [stats, setStats] = useState<{ total: number; sepsis: number; healthy: number; borderline: number } | null>(
    null,
  )

  const handleDatasetSelect = async (dataset: Dataset) => {
    setLoading(true)
    setError(null)
    setResults([])
    setSelectedDataset(dataset)

    try {
      const response = await fetch(dataset.file)
      if (!response.ok) throw new Error("Failed to fetch dataset")

      const csvText = await response.text()
      const formData = new FormData()
      const blob = new Blob([csvText], { type: "text/csv" })
      const file = new File([blob], `${dataset.id}.csv`, { type: "text/csv" })
      formData.append("file", file)

      const batchResponse = await fetch("/api/batch-predict", {
        method: "POST",
        body: formData,
      })

      if (!batchResponse.ok) {
        const errorData = await batchResponse.json()
        throw new Error(errorData.error || "Failed to process dataset")
      }

      const data = await batchResponse.json()
      setResults(data.predictions || [])

      // Calculate statistics
      const sepsisPredictions =
        data.predictions?.filter((p: any) => p.final_prediction === "Sepsis Detected").length || 0
      const healthyPredictions = data.predictions?.filter((p: any) => p.final_prediction === "No Sepsis").length || 0
      const borderlinePredictions =
        data.predictions?.filter((p: any) => p.final_prediction === "Borderline").length || 0

      setStats({
        total: data.predictions?.length || 0,
        sepsis: sepsisPredictions,
        healthy: healthyPredictions,
        borderline: borderlinePredictions,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
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
            <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground transition">
              Upload
            </Link>
            <Link href="/test-datasets" className="text-sm text-foreground font-medium">
              Test Datasets
            </Link>
            <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition">
              Compare
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Test Datasets</h1>
        <p className="text-lg text-muted-foreground">
          Test the model with pre-built datasets containing various patient cases to evaluate prediction accuracy and
          model robustness.
        </p>
      </section>

      {/* Dataset Selection */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Available Datasets</h2>
        <DatasetSelector onSelect={handleDatasetSelect} loading={loading} />
      </section>

      {/* Results Section */}
      {(results.length > 0 || loading || error) && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {error && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <Card className="p-12 border border-border bg-card/50 text-center">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Processing Dataset...</h3>
              <p className="text-muted-foreground">Running predictions on all records</p>
            </Card>
          )}

          {results.length > 0 && (
            <>
              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 border border-border">
                    <div className="text-sm text-muted-foreground">Total Records</div>
                    <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
                  </Card>
                  <Card className="p-4 border border-destructive/20 bg-destructive/5">
                    <div className="text-sm text-destructive">Sepsis Detected</div>
                    <div className="text-2xl font-bold text-destructive mt-1">{stats.sepsis}</div>
                  </Card>
                  <Card className="p-4 border border-green-500/20 bg-green-500/5">
                    <div className="text-sm text-green-700 dark:text-green-400">No Sepsis</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{stats.healthy}</div>
                  </Card>
                  <Card className="p-4 border border-yellow-500/20 bg-yellow-500/5">
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">Borderline</div>
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mt-1">
                      {stats.borderline}
                    </div>
                  </Card>
                </div>
              )}

              {/* Results Table */}
              <Card className="p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Prediction Results</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {results.length} predictions from {selectedDataset?.name}
                    </p>
                  </div>
                </div>
                <PredictionResultsTable results={results} />
              </Card>
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>Sepsis Detection ML App | Built for academic and clinical research purposes</p>
        </div>
      </footer>
    </main>
  )
}
