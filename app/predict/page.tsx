"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { PredictionForm } from "@/components/prediction-form"
import { PredictionResults } from "@/components/prediction-results"

export default function PredictPage() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async (formData: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error("Prediction error:", error)
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
            <Link href="/predict" className="text-sm font-medium text-primary">
              Predict
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Patient Assessment</h1>
            <p className="text-muted-foreground mb-6">Enter patient health parameters to predict sepsis risk</p>
            <PredictionForm onSubmit={handlePredict} loading={loading} />
          </div>

          {/* Results Section */}
          <div>
            {predictions ? (
              <PredictionResults predictions={predictions} />
            ) : (
              <Card className="p-8 border border-border text-center">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No predictions yet</p>
                  <p className="text-sm">Fill out the form and click predict to see results</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
