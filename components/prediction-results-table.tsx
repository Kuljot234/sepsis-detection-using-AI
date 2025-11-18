"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PredictionResult {
  row_number: number
  hr?: number
  o2sat?: number
  temp?: number
  sbp?: number
  dbp?: number
  resp?: number
  wbc?: number
  logistic_regression?: string
  decision_tree?: string
  random_forest?: string
  final_prediction?: string
  risk_score?: number
  ensemble_vote?: number
  [key: string]: string | number | undefined
}

interface PredictionResultsTableProps {
  results: PredictionResult[]
}

export function PredictionResultsTable({ results }: PredictionResultsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const displayColumns = [
    { key: "row_number", label: "Row" },
    { key: "hr", label: "HR" },
    { key: "temp", label: "Temp" },
    { key: "sbp", label: "SBP" },
    { key: "dbp", label: "DBP" },
    { key: "resp", label: "RR" },
    { key: "o2sat", label: "O2Sat" },
    { key: "wbc", label: "WBC" },
    { key: "final_prediction", label: "Ensemble Prediction" },
    { key: "risk_score", label: "Risk Score" },
  ]

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 w-8"></th>
              {displayColumns.map((col) => (
                <th key={col.key} className="text-left py-3 px-4 font-semibold text-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(col.key)}
                    className="h-auto p-0 hover:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      <SortIcon column={col.key} />
                    </div>
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-muted/50 transition">
                <td className="text-left py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    className="h-auto p-0"
                  >
                    {expandedRow === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </td>
                {displayColumns.map((col) => {
                  const value = result[col.key]
                  let displayValue = ""
                  let cellClass = "py-3 px-4 text-muted-foreground"

                  if (col.key === "final_prediction") {
                    displayValue = String(value || "N/A")
                    cellClass = "py-3 px-4"
                  } else if (col.key === "risk_score") {
                    displayValue = value ? value.toFixed(1) : "N/A"
                  } else if (typeof value === "number") {
                    displayValue = value.toFixed(1)
                  } else {
                    displayValue = String(value || "—")
                  }

                  if (col.key === "final_prediction") {
                    const pred = String(value || "")
                    const isSepsis = pred.includes("Detected")
                    return (
                      <td key={col.key} className={cellClass}>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isSepsis ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                          }`}
                        >
                          {displayValue}
                        </span>
                      </td>
                    )
                  }

                  return (
                    <td key={col.key} className={cellClass}>
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedRow !== null && sortedResults[expandedRow] && (
        <Card className="p-6 border border-primary/20 bg-primary/5">
          <h3 className="font-semibold text-foreground mb-4">
            Model Predictions - Row {sortedResults[expandedRow].row_number}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">Logistic Regression</div>
              <div className="text-lg font-semibold text-foreground">
                {sortedResults[expandedRow].logistic_regression || "N/A"}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">Decision Tree</div>
              <div className="text-lg font-semibold text-foreground">
                {sortedResults[expandedRow].decision_tree || "N/A"}
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-xs font-medium text-muted-foreground mb-1">Random Forest (Primary)</div>
              <div className="text-lg font-semibold text-primary">
                {sortedResults[expandedRow].random_forest || "N/A"}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-card border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">
              Ensemble Voting Result: {sortedResults[expandedRow].ensemble_vote || 0}/3 models agree
            </div>
            <div className="text-2xl font-bold text-primary">
              {sortedResults[expandedRow].final_prediction || "N/A"}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
