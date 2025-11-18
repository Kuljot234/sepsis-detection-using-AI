import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SD</span>
            </div>
            <span className="font-semibold text-foreground">Sepsis Detection</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/predict" className="text-sm text-muted-foreground hover:text-foreground transition">
              Predict
            </Link>
            <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground transition">
              Upload
            </Link>
            <Link href="/test-datasets" className="text-sm text-muted-foreground hover:text-foreground transition">
              Test Datasets
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

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">Sepsis Risk Detection</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Advanced machine learning models to predict sepsis risk based on patient health parameters. Get instant
          predictions from multiple models for clinical decision support.
        </p>
        <Link href="/predict">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Start Prediction
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-border hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🔬</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Models</h3>
            <p className="text-muted-foreground">
              Ensemble predictions from Logistic Regression, Decision Tree, and Random Forest models.
            </p>
          </Card>

          <Card className="p-6 border border-border hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Instant Results</h3>
            <p className="text-muted-foreground">
              Get real-time predictions with confidence scores and model comparison metrics.
            </p>
          </Card>

          <Card className="p-6 border border-border hover:border-primary/50 transition">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Model Metrics</h3>
            <p className="text-muted-foreground">
              Compare accuracy, precision, recall, and F1-scores across all models.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card className="p-12 bg-primary/5 border border-primary/20">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to predict?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Enter patient health parameters to get instant sepsis risk predictions from our ML models.
          </p>
          <Link href="/predict">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Go to Prediction Tool
            </Button>
          </Link>
        </Card>
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
