"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Dataset {
  id: string
  name: string
  description: string
  file: string
  rowCount: number
  category: "positive" | "negative" | "mixed" | "edge"
}

const datasets: Dataset[] = [
  {
    id: "sepsis-positive",
    name: "Sepsis Cases",
    description: "10 confirmed sepsis cases with elevated vitals and abnormal labs",
    file: "/datasets/sepsis-positive.csv",
    rowCount: 10,
    category: "positive",
  },
  {
    id: "sepsis-negative",
    name: "Healthy Controls",
    description: "10 healthy patients with normal vital signs and laboratory values",
    file: "/datasets/sepsis-negative.csv",
    rowCount: 10,
    category: "negative",
  },
  {
    id: "mixed-cases",
    name: "Mixed Dataset",
    description: "20 mixed cases combining both sepsis and healthy patient data",
    file: "/datasets/mixed-cases.csv",
    rowCount: 20,
    category: "mixed",
  },
  {
    id: "edge-cases",
    name: "Edge Cases",
    description: "10 edge cases with extreme values for testing model robustness",
    file: "/datasets/edge-cases.csv",
    rowCount: 10,
    category: "edge",
  },
]

interface DatasetSelectorProps {
  onSelect: (dataset: Dataset) => void
  loading?: boolean
}

const categoryColors: Record<string, string> = {
  positive: "bg-destructive/10 text-destructive",
  negative: "bg-green-500/10 text-green-700 dark:text-green-400",
  mixed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  edge: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
}

export function DatasetSelector({ onSelect, loading }: DatasetSelectorProps) {
  const handleDownload = async (dataset: Dataset) => {
    try {
      const response = await fetch(dataset.file)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${dataset.id}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download dataset:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {datasets.map((dataset) => (
        <Card key={dataset.id} className="p-4 border border-border hover:border-primary/50 transition flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{dataset.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{dataset.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className={categoryColors[dataset.category]}>
              {dataset.category === "positive" && "Sepsis"}
              {dataset.category === "negative" && "Healthy"}
              {dataset.category === "mixed" && "Mixed"}
              {dataset.category === "edge" && "Edge"}
            </Badge>
            <Badge variant="outline">{dataset.rowCount} rows</Badge>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button
              size="sm"
              onClick={() => onSelect(dataset)}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? "Processing..." : "Test"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDownload(dataset)} className="flex-1">
              Download
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
