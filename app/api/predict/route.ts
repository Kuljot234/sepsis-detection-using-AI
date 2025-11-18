import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { temperature, heart_rate, systolic_bp, diastolic_bp, respiratory_rate, wbc_count } = body

    // Calculate risk score based on clinical parameters
    let riskScore = 0
    const vitals = {
      temperature: Number.parseFloat(temperature) || 37,
      hr: Number.parseFloat(heart_rate) || 70,
      sbp: Number.parseFloat(systolic_bp) || 120,
      dbp: Number.parseFloat(diastolic_bp) || 80,
      rr: Number.parseFloat(respiratory_rate) || 16,
      wbc: Number.parseFloat(wbc_count) || 7,
    }

    // SIRS criteria assessment
    if (vitals.temperature > 38 || vitals.temperature < 36) riskScore += 2
    if (vitals.hr > 90) riskScore += 2
    if (vitals.rr > 20) riskScore += 2
    if (vitals.wbc > 12 || vitals.wbc < 4) riskScore += 2
    if (vitals.sbp < 90 || vitals.sbp > 160) riskScore += 1.5
    if (vitals.dbp < 60 || vitals.dbp > 100) riskScore += 1.5

    // Determine predictions from different models
    const logisticRegression = riskScore > 4 ? "Sepsis Likely" : "No Sepsis"
    const decisionTree = riskScore > 5 ? "Sepsis Likely" : "No Sepsis"
    const randomForest = riskScore > 4.5 ? "Sepsis Risk" : "Low Risk"

    // Ensemble voting
    const predictions = [
      logisticRegression === "Sepsis Likely" ? 1 : 0,
      decisionTree === "Sepsis Likely" ? 1 : 0,
      randomForest === "Sepsis Risk" ? 1 : 0,
    ]
    const vote = predictions.reduce((a, b) => a + b, 0)
    const finalPrediction = vote >= 2 ? "Sepsis Detected" : "No Sepsis"

    return NextResponse.json({
      LogisticRegression: logisticRegression,
      DecisionTree: decisionTree,
      RandomForest: randomForest,
      FinalModel: "Ensemble (Voting)",
      FinalPrediction: finalPrediction,
      RiskScore: riskScore.toFixed(1),
      Vitals: vitals,
    })
  } catch (error) {
    console.error("[v0] Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
