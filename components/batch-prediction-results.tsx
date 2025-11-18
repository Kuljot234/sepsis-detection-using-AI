"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PredictionResult {
  row_number: number
  logistic_regression: string | number | undefined
  logistic_confidence: number | undefined
  decision_tree: string | number | undefined
  decision_tree_confidence: number | undefined
  random_forest: string | number | undefined
  random_forest_confidence: number | undefined
  final_prediction: string | number | undefined
  ensemble_confidence: number | undefined
  ensemble_vote: number | undefined
  risk_score: number | undefined
  sirs_score: number | undefined
  [key: string]: string | number | undefined
}

export function BatchPredictionResults({ results }: { results: PredictionResult[] }) {
  const [selectedRow, setSelectedRow] = useState<PredictionResult | null>(null)

  const stats = {
    sepsisDetected: results.filter((r) => String(r.final_prediction).trim() === "Sepsis Detected").length,
    borderline: results.filter((r) => String(r.final_prediction).trim() === "Borderline").length,
    noSepsis: results.filter((r) => String(r.final_prediction).trim() === "No Sepsis").length,
    avgEnsembleConfidence: (
      results.reduce((sum, r) => sum + ((r.ensemble_confidence as number) || 0), 0) / results.length
    ).toFixed(1),
    avgRiskScore: (results.reduce((sum, r) => sum + ((r.risk_score as number) || 0), 0) / results.length).toFixed(2),
  }

  const modelAgreement = results.filter((r) => {
    const lrPred = String(r.logistic_regression).trim()
    const dtPred = String(r.decision_tree).trim()
    const rfPred = String(r.random_forest).trim()
    return lrPred === dtPred && dtPred === rfPred
  }).length

  const getPredictionColor = (prediction: string | undefined) => {
    if (!prediction) return "secondary"
    const pred = String(prediction).toLowerCase()
    if (pred.includes("sepsis")) return "destructive"
    if (pred.includes("borderline")) return "warning"
    return "secondary"
  }

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return ""
    if (confidence >= 70) return "text-destructive"
    if (confidence >= 50) return "text-orange-500"
    return "text-green-600"
  }

  const getVitalsOnly = (result: PredictionResult) => {
    const vitalKeys = [
      "hr",
      "o2sat",
      "temp",
      "sbp",
      "dbp",
      "map",
      "resp",
      "ph",
      "lactate",
      "creatinine",
      "glucose",
      "bun",
      "wbc",
      "hgb",
      "hct",
      "platelet",
    ]

    const vitals: Record<string, string | number | undefined> = {}
    vitalKeys.forEach((key) => {
      if (result[key] !== undefined) {
        vitals[key] = result[key]
      }
    })
    return vitals
  }

  return (
    <>
      {/* Summary Statistics */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Card className="p-3 border border-border">
          <div className="text-sm text-muted-foreground">Sepsis Detected</div>
          <div className="text-2xl font-bold text-destructive">{stats.sepsisDetected}</div>
          <div className="text-xs text-muted-foreground">
            {((stats.sepsisDetected / results.length) * 100).toFixed(0)}%
          </div>
        </Card>
        <Card className="p-3 border border-border">
          <div className="text-sm text-muted-foreground">Borderline</div>
          <div className="text-2xl font-bold text-orange-500">{stats.borderline}</div>
          <div className="text-xs text-muted-foreground">{((stats.borderline / results.length) * 100).toFixed(0)}%</div>
        </Card>
        <Card className="p-3 border border-border">
          <div className="text-sm text-muted-foreground">No Sepsis</div>
          <div className="text-2xl font-bold text-green-600">{stats.noSepsis}</div>
          <div className="text-xs text-muted-foreground">{((stats.noSepsis / results.length) * 100).toFixed(0)}%</div>
        </Card>
        <Card className="p-3 border border-border">
          <div className="text-sm text-muted-foreground">Model Agreement</div>
          <div className="text-2xl font-bold text-blue-600">
            {((modelAgreement / results.length) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {modelAgreement}/{results.length} patients
          </div>
        </Card>
        <Card className="p-3 border border-border">
          <div className="text-sm text-muted-foreground">Avg Confidence</div>
          <div className="text-2xl font-bold">{stats.avgEnsembleConfidence}%</div>
          <div className="text-xs text-muted-foreground">Risk Score: {stats.avgRiskScore}</div>
        </Card>
      </div>

      {/* Results Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary/10 z-10">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="font-semibold">Row</TableHead>
                <TableHead className="font-semibold">Logistic Regression</TableHead>
                <TableHead className="font-semibold">Decision Tree</TableHead>
                <TableHead className="font-semibold">Random Forest</TableHead>
                <TableHead className="font-semibold">Final Verdict</TableHead>
                <TableHead className="font-semibold text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.row_number} className="hover:bg-secondary/5 border-b border-border/50">
                  <TableCell className="font-medium text-foreground">{result.row_number}</TableCell>

                  {/* Logistic Regression */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={result.logistic_regression ? "outline" : "secondary"} className="w-fit text-xs">
                        {String(result.logistic_regression || "—")}
                      </Badge>
                      {result.logistic_confidence && (
                        <span
                          className={`text-xs font-semibold ${getConfidenceColor(result.logistic_confidence as number)}`}
                        >
                          {Number(result.logistic_confidence).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Decision Tree */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={result.decision_tree ? "outline" : "secondary"} className="w-fit text-xs">
                        {String(result.decision_tree || "—")}
                      </Badge>
                      {result.decision_tree_confidence && (
                        <span
                          className={`text-xs font-semibold ${getConfidenceColor(result.decision_tree_confidence as number)}`}
                        >
                          {Number(result.decision_tree_confidence).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Random Forest */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={result.random_forest ? "outline" : "secondary"} className="w-fit text-xs">
                        {String(result.random_forest || "—")}
                      </Badge>
                      {result.random_forest_confidence && (
                        <span
                          className={`text-xs font-semibold ${getConfidenceColor(result.random_forest_confidence as number)}`}
                        >
                          {Number(result.random_forest_confidence).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Final Prediction */}
                  <TableCell>
                    <Badge
                      variant={getPredictionColor(String(result.final_prediction))}
                      className="w-fit text-xs font-bold"
                    >
                      {String(result.final_prediction || "—")}
                    </Badge>
                  </TableCell>

                  {/* Details Button */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRow(result)} className="text-xs">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient {selectedRow?.row_number} Details</DialogTitle>
            <DialogDescription>Full prediction analysis for this patient</DialogDescription>
          </DialogHeader>

          {selectedRow && (
            <div className="space-y-6">
              {/* Model 1: Logistic Regression */}
              <Card className="p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Model 1: Logistic Regression</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prediction:</span>
                    <Badge>{selectedRow.logistic_regression}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(selectedRow.logistic_confidence as number)}`}>
                      {Number(selectedRow.logistic_confidence).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Model 2: Decision Tree */}
              <Card className="p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Model 2: Decision Tree</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prediction:</span>
                    <Badge>{selectedRow.decision_tree}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span
                      className={`font-semibold ${getConfidenceColor(selectedRow.decision_tree_confidence as number)}`}
                    >
                      {Number(selectedRow.decision_tree_confidence).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Model 3: Random Forest */}
              <Card className="p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Model 3: Random Forest</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prediction:</span>
                    <Badge>{selectedRow.random_forest}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span
                      className={`font-semibold ${getConfidenceColor(selectedRow.random_forest_confidence as number)}`}
                    >
                      {Number(selectedRow.random_forest_confidence).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Ensemble Result */}
              <Card className="p-4 border border-border bg-primary/5">
                <h3 className="font-semibold text-foreground mb-3">Ensemble Result</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Prediction:</span>
                    <Badge variant="outline" className="font-bold">
                      {selectedRow.final_prediction}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ensemble Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(selectedRow.ensemble_confidence as number)}`}>
                      {Number(selectedRow.ensemble_confidence).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ensemble Vote:</span>
                    <span className="font-semibold">{selectedRow.ensemble_vote}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className="font-semibold">{Number(selectedRow.risk_score).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SIRS Score:</span>
                    <span className="font-semibold">{selectedRow.sirs_score}</span>
                  </div>
                </div>
              </Card>

              {/* Patient Vitals */}
              <Card className="p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Patient Vitals & Labs</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(getVitalsOnly(selectedRow)).map(([key, value]) => (
                    <div key={key} className="flex justify-between pb-2 border-b border-border/30">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="font-semibold">{value ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
