"use client"

import { Card } from "@/components/ui/card"

interface PredictionResultsProps {
  predictions: {
    LogisticRegression: string
    DecisionTree: string
    RandomForest: string
    FinalModel: string
    FinalPrediction: string
    RiskScore?: string
  }
}

export function PredictionResults({ predictions }: PredictionResultsProps) {
  if (!predictions || !predictions.FinalPrediction) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No prediction data available</p>
      </div>
    )
  }

  const isSepsis = predictions.FinalPrediction?.includes("Sepsis") ?? false

  return (
    <div className="space-y-4">
      <Card
        className={`p-6 border-2 ${isSepsis ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}`}
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">Final Prediction</h2>
        <p className={`text-3xl font-bold ${isSepsis ? "text-destructive" : "text-primary"}`}>
          {predictions.FinalPrediction}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Model: {predictions.FinalModel}</p>
        {predictions.RiskScore && (
          <p className="text-sm text-muted-foreground mt-1">Risk Score: {predictions.RiskScore}</p>
        )}
      </Card>

      <Card className="p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Model Predictions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground">Logistic Regression</span>
            <span className="text-sm font-semibold text-accent">{predictions.LogisticRegression}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground">Decision Tree</span>
            <span className="text-sm font-semibold text-accent">{predictions.DecisionTree}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-foreground">Random Forest (Primary)</span>
            <span className="text-sm font-semibold text-primary">{predictions.RandomForest}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
