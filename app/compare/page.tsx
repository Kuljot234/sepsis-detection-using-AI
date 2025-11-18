"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ModelMetricsTable } from "@/components/model-metrics-table"
import { MetricsChart } from "@/components/metrics-chart"

export default function ComparePage() {
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
            <Link href="/compare" className="text-sm font-medium text-primary">
              Compare
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Model Comparison</h1>
        <p className="text-muted-foreground mb-8">Performance metrics for all three machine learning models</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Performance Metrics</h2>
            <ModelMetricsTable />
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Metrics Visualization</h2>
            <MetricsChart />
          </Card>
        </div>

        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Model Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Logistic Regression</h3>
              <p className="text-sm text-muted-foreground">
                Linear model for binary classification. Fast and interpretable, good baseline model.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Decision Tree</h3>
              <p className="text-sm text-muted-foreground">
                Tree-based model that captures non-linear relationships. Easy to interpret decision paths.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Random Forest</h3>
              <p className="text-sm text-muted-foreground">
                Ensemble of decision trees. Best overall performance with reduced overfitting.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
