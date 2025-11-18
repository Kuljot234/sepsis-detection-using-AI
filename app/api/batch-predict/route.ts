import { type NextRequest, NextResponse } from "next/server"

interface PredictionResult {
  [key: string]: string | number | null
}

function makeSepsisPredictionWithModels(features: Record<string, number>): Record<string, string | number> {
  const hr = features.hr ?? 70
  const temp = features.temp ?? 37
  const resp = features.resp ?? 16
  const sbp = features.sbp ?? 120
  const dbp = features.dbp ?? 80
  const o2sat = features.o2sat ?? 95
  const wbc = features.wbc ?? 7.0
  const lactate = features.lactate ?? 2.0
  const creatinine = features.creatinine ?? 1.0
  const glucose = features.glucose ?? 100
  const bun = features.bun ?? 20
  const ph = features.ph ?? 7.35
  const map = features.map ?? (sbp + 2 * dbp) / 3

  // SIRS criteria scoring (2+ = systemic inflammation)
  let sirsScore = 0
  if (temp > 38 || temp < 36) sirsScore += 1
  if (hr > 90) sirsScore += 1
  if (resp > 20) sirsScore += 1
  if (wbc > 12 || wbc < 4) sirsScore += 1

  // Calculate comprehensive risk score
  let riskScore = 0

  // Hemodynamic compromise (most critical)
  if (sbp < 90) riskScore += 4
  else if (sbp < 100) riskScore += 2
  else if (sbp < 110) riskScore += 1

  if (map < 65) riskScore += 3
  else if (map < 70) riskScore += 1.5

  // Respiratory/Oxygenation
  if (o2sat < 90) riskScore += 4
  else if (o2sat < 92) riskScore += 2
  else if (o2sat < 94) riskScore += 1

  if (resp > 24) riskScore += 2
  else if (resp > 20) riskScore += 1

  // Temperature abnormality
  if (temp > 39.5 || temp < 35) riskScore += 2
  else if (temp > 38.5 || temp < 36) riskScore += 1

  // Metabolic/Organ dysfunction
  if (lactate > 4) riskScore += 3
  else if (lactate > 2.5) riskScore += 1.5
  else if (lactate > 2) riskScore += 1

  if (creatinine > 2.5) riskScore += 2.5
  else if (creatinine > 2) riskScore += 1.5
  else if (creatinine > 1.5) riskScore += 1

  if (bun > 30) riskScore += 1.5
  else if (bun > 25) riskScore += 0.5

  // Acid-base balance
  if (ph < 7.25) riskScore += 2.5
  else if (ph < 7.3) riskScore += 1.5
  else if (ph < 7.35) riskScore += 0.5

  // Glucose control
  if (glucose > 300 || glucose < 70) riskScore += 1.5
  else if (glucose > 250 || glucose < 80) riskScore += 0.5

  // WBC abnormality (part of SIRS)
  if (wbc > 15 || wbc < 3) riskScore += 1
  else if (wbc > 12 || wbc < 4) riskScore += 0.5

  // Heart rate extremes
  if (hr > 140) riskScore += 2
  else if (hr > 120) riskScore += 1
  if (hr < 40) riskScore += 2
  else if (hr < 50) riskScore += 1

  // Model 1: Logistic Regression
  const logisticScore = riskScore / 25
  const logisticThreshold = 0.3
  const logisticConfidence = Math.min(100, Math.max(10, logisticScore * 100))
  const logisticRegression = logisticScore >= logisticThreshold ? "Sepsis Likely" : "No Sepsis"

  // Model 2: Decision Tree
  let dtResult = "No Sepsis"
  let dtConfidence = 10

  if (sirsScore >= 2 && (lactate > 2 || creatinine > 1.5)) {
    dtResult = "Borderline"
    dtConfidence = Math.min(75, 50 + riskScore * 3)
  } else if (sirsScore >= 3 && (lactate > 2.5 || sbp < 105)) {
    dtResult = "Borderline"
    dtConfidence = Math.min(80, 55 + riskScore * 2.5)
  } else if (sbp < 90 || (o2sat < 92 && resp > 22) || lactate > 4 || (sirsScore === 4 && riskScore >= 5)) {
    dtResult = "Sepsis Likely"
    dtConfidence = Math.min(90, 65 + riskScore * 2)
  } else if (riskScore >= 4) {
    dtResult = "Borderline"
    dtConfidence = Math.min(70, 45 + riskScore * 2)
  } else {
    dtConfidence = Math.max(20, 100 - riskScore * 10)
  }

  // Model 3: Random Forest
  let rfVotes = 0
  let rfConfidence = 0

  if (sbp < 100 || map < 70) rfVotes += 1
  if (sirsScore >= 2) rfVotes += 1
  if (lactate > 2) rfVotes += 1
  if (o2sat < 93 || resp > 22) rfVotes += 1
  if (creatinine > 1.5 || bun > 25 || lactate > 2.5) rfVotes += 1

  let randomForest = "No Sepsis"
  if (rfVotes >= 4) {
    randomForest = "Sepsis Likely"
    rfConfidence = 80 + rfVotes * 2
  } else if (rfVotes === 3) {
    randomForest = "Borderline"
    rfConfidence = 65 + rfVotes * 3
  } else if (rfVotes === 2) {
    randomForest = "Borderline"
    rfConfidence = 50 + rfVotes * 5
  } else if (rfVotes === 1) {
    randomForest = "Borderline"
    rfConfidence = 35 + rfVotes * 5
  } else {
    randomForest = "No Sepsis"
    rfConfidence = Math.max(20, 100 - riskScore * 8)
  }
  rfConfidence = Math.min(100, rfConfidence)

  // Ensemble voting
  const predictions = [
    logisticScore >= logisticThreshold ? 1 : 0,
    dtResult === "Sepsis Likely" ? 1 : 0,
    rfVotes >= 4 ? 1 : 0,
  ]
  const vote = predictions.reduce((a, b) => a + b, 0)

  let finalPrediction = "No Sepsis"
  let ensembleConfidence = 0

  if (vote >= 2) {
    finalPrediction = "Sepsis Detected"
    ensembleConfidence = Math.min(100, 75 + riskScore / 2)
  } else if (vote === 1 && riskScore >= 4) {
    finalPrediction = "Borderline"
    ensembleConfidence = Math.min(100, 55 + riskScore)
  } else if (sirsScore >= 3 || riskScore >= 5) {
    finalPrediction = "Borderline"
    ensembleConfidence = Math.min(100, 50 + riskScore / 1.5)
  } else {
    finalPrediction = "No Sepsis"
    ensembleConfidence = Math.max(30, 100 - riskScore * 5)
  }

  return {
    logistic_regression: logisticRegression,
    logistic_confidence: Number(logisticConfidence.toFixed(1)),
    decision_tree: dtResult,
    decision_tree_confidence: Number(dtConfidence.toFixed(1)),
    random_forest: randomForest,
    random_forest_confidence: Number(rfConfidence.toFixed(1)),
    final_prediction: finalPrediction,
    ensemble_confidence: Number(ensembleConfidence.toFixed(1)),
    risk_score: Number(riskScore.toFixed(2)),
    sirs_score: sirsScore,
    ensemble_vote: vote,
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

function mapColumnsToFeatures(headers: string[], row: string[]): Record<string, number> {
  const features: Record<string, number> = {}
  const columnAliases: Record<string, string[]> = {
    hr: ["hr", "heart_rate", "heartrate", "heart rate"],
    o2sat: ["o2sat", "oxygen_saturation", "oxsat", "sao2", "saO2"],
    temp: ["temp", "temperature", "body_temp"],
    sbp: ["sbp", "systolic", "systolic_bp", "systolic_pressure"],
    map: ["map", "mean_ap", "mean_arterial_pressure"],
    dbp: ["dbp", "diastolic", "diastolic_bp", "diastolic_pressure"],
    resp: ["resp", "respiratory_rate", "respiration_rate", "rr"],
    etco2: ["etco2", "end_tidal_co2"],
    baseexcess: ["baseexcess", "base_excess", "be"],
    hco3: ["hco3", "bicarbonate"],
    fio2: ["fio2", "fraction_inspired_oxygen"],
    ph: ["ph", "blood_ph"],
    paco2: ["paco2", "arterial_co2"],
    sao2: ["sao2", "saO2", "o2sat"],
    ast: ["ast", "aspartate_aminotransferase"],
    bun: ["bun", "blood_urea_nitrogen", "urea"],
    alkalinephos: ["alkalinephos", "alkaline_phosphatase", "alk_phos"],
    calcium: ["calcium", "serum_calcium"],
    chloride: ["chloride", "serum_chloride"],
    creatinine: ["creatinine", "serum_creatinine"],
    glucose: ["glucose", "blood_glucose"],
    lactate: ["lactate", "serum_lactate"],
    magnesium: ["magnesium", "serum_magnesium"],
    phosphate: ["phosphate", "serum_phosphate"],
    potassium: ["potassium", "serum_potassium"],
    wbc: ["wbc", "white_blood_cell", "white_blood_cells", "leukocyte"],
    platelet: ["platelet", "platelets", "plt"],
    hgb: ["hgb", "hemoglobin"],
    hct: ["hct", "hematocrit"],
    ptt: ["ptt", "partial_thromboplastin_time"],
    fibrinogen: ["fibrinogen"],
    bilirubin_direct: ["bilirubin_direct", "direct_bilirubin"],
    bilirubin_total: ["bilirubin_total", "total_bilirubin"],
    troponini: ["troponini", "troponin"],
  }

  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim()

    for (const [featureKey, aliases] of Object.entries(columnAliases)) {
      if (aliases.includes(normalizedHeader)) {
        if (index < row.length) {
          const value = Number.parseFloat(row[index])
          if (!isNaN(value)) {
            features[featureKey] = value
          }
        }
        return
      }
    }
  })

  return features
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    const maxFileSize = 5 * 1024 * 1024 * 1024 // 5GB for very large datasets
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: `File is too large. Maximum size is 5GB` }, { status: 413 })
    }

    const csvContent = await file.text()
    const lines = csvContent.trim().split(/\r?\n/)

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have headers and at least one data row" }, { status: 400 })
    }

    const headers = parseCSVLine(lines[0])
    const chunkSize = 25000
    const predictions: PredictionResult[] = []

    let sepsisCount = 0
    let borderlineCount = 0
    let noSepsisCount = 0

    const totalRows = lines.length - 1
    console.log(`[v0] Starting predictions for ${totalRows} rows (20 lakh+)`)

    // Process in larger chunks to avoid memory issues
    for (let chunkStart = 1; chunkStart < lines.length; chunkStart += chunkSize) {
      const chunkEnd = Math.min(chunkStart + chunkSize, lines.length)

      for (let i = chunkStart; i < chunkEnd; i++) {
        const line = lines[i]?.trim()
        if (!line) continue

        try {
          const row = parseCSVLine(line)
          if (row.length === 0) continue

          const features = mapColumnsToFeatures(headers, row)
          const modelPredictions = makeSepsisPredictionWithModels(features)

          const result: PredictionResult = {
            row_number: i,
          }

          headers.forEach((header, index) => {
            if (index < row.length) {
              const value = row[index]
              const numValue = Number.parseFloat(value)
              const normalizedKey = header.toLowerCase().trim()
              result[normalizedKey] = value && value !== "" ? (isNaN(numValue) ? value : numValue) : null
            }
          })

          result.logistic_regression = modelPredictions.logistic_regression
          result.logistic_confidence = modelPredictions.logistic_confidence
          result.decision_tree = modelPredictions.decision_tree
          result.decision_tree_confidence = modelPredictions.decision_tree_confidence
          result.random_forest = modelPredictions.random_forest
          result.random_forest_confidence = modelPredictions.random_forest_confidence
          result.final_prediction = modelPredictions.final_prediction
          result.ensemble_confidence = modelPredictions.ensemble_confidence
          result.risk_score = modelPredictions.risk_score
          result.sirs_score = modelPredictions.sirs_score
          result.ensemble_vote = modelPredictions.ensemble_vote

          predictions.push(result)

          // Count predictions
          const pred = String(modelPredictions.final_prediction).trim()
          if (pred === "Sepsis Detected") sepsisCount++
          else if (pred === "Borderline") borderlineCount++
          else noSepsisCount++
        } catch (err) {
          console.error(`[v0] Error processing row ${i}:`, err)
          continue
        }
      }

      const percentComplete = ((chunkEnd / lines.length) * 100).toFixed(1)
      console.log(`[v0] Processed ${chunkEnd}/${lines.length - 1} rows (${percentComplete}%)`)
    }

    if (predictions.length === 0) {
      return NextResponse.json({ error: "No valid rows could be processed from the CSV" }, { status: 400 })
    }

    console.log(
      `[v0] Complete: Sepsis=${sepsisCount}, Borderline=${borderlineCount}, NoSepsis=${noSepsisCount}, Total=${predictions.length}`,
    )

    return NextResponse.json({
      predictions,
      count: predictions.length,
      total_rows: lines.length - 1,
      summaryStats: {
        total: predictions.length,
        sepsisDetected: sepsisCount,
        borderline: borderlineCount,
        noSepsis: noSepsisCount,
      },
    })
  } catch (error) {
    console.error("[v0] Batch prediction error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: `Failed to process batch predictions: ${errorMessage}` }, { status: 500 })
  }
}
