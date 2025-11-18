import Link from "next/link"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
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
            <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition">
              Compare
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary">
              About
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">About This Project</h1>

        <div className="space-y-8">
          <Card className="p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Project Overview</h2>
            <p className="text-muted-foreground mb-4">
              This sepsis detection application demonstrates the use of machine learning models for clinical decision
              support. The system uses three different algorithms to predict sepsis risk based on patient health
              parameters.
            </p>
            <p className="text-muted-foreground">
              Sepsis is a life-threatening condition that occurs when the body's response to infection causes tissue
              damage. Early detection and intervention are critical for improving patient outcomes.
            </p>
          </Card>

          <Card className="p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Random Forest?</h2>
            <p className="text-muted-foreground mb-4">
              Random Forest was selected as the primary model for several reasons:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Superior accuracy compared to individual decision trees</li>
              <li>Reduced overfitting through ensemble averaging</li>
              <li>Handles non-linear relationships effectively</li>
              <li>Provides feature importance rankings</li>
              <li>Robust to outliers and missing values</li>
              <li>Fast prediction time suitable for clinical use</li>
            </ul>
          </Card>

          <Card className="p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Methodology</h2>
            <p className="text-muted-foreground mb-4">
              The models were trained on clinical patient data with the following parameters:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-2">Input Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Temperature (°C)</li>
                  <li>Heart Rate (bpm)</li>
                  <li>Systolic BP (mmHg)</li>
                  <li>Diastolic BP (mmHg)</li>
                  <li>Respiratory Rate (breaths/min)</li>
                  <li>White Blood Cell Count</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">Output:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Sepsis Detected</li>
                  <li>No Sepsis</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Developer</h2>
            <p className="text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">Kuljot Singh</span>
            </p>
            <p className="text-muted-foreground">
              This project was created as an academic machine learning demonstration. It showcases the application of
              ensemble learning techniques to healthcare prediction tasks.
            </p>
          </Card>

          <Card className="p-8 border border-border bg-accent/5">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer</h2>
            <p className="text-muted-foreground text-sm">
              This application is for educational and research purposes only. It should not be used for actual clinical
              decision-making without proper validation and regulatory approval. Always consult with qualified
              healthcare professionals for medical diagnosis and treatment.
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}
