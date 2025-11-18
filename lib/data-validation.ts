export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recordCount: number
}

export function validateDataset(csv: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const lines = csv.trim().split(/\r?\n/)

  if (lines.length < 2) {
    errors.push("CSV must have headers and at least one data row")
    return { isValid: false, errors, warnings, recordCount: 0 }
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  // Required columns
  const requiredColumns = [
    "hr",
    "o2sat",
    "temp",
    "sbp",
    "dbp",
    "resp",
    "wbc",
    "bun",
    "creatinine",
    "glucose",
    "lactate",
    "ph",
  ]
  const missingColumns = requiredColumns.filter((col) => !headers.some((h) => h.includes(col)))

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`)
  }

  // Validate data ranges
  let validRecordCount = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",").map((v) => v.trim())

    if (values.length !== headers.length) {
      warnings.push(`Row ${i}: Column count mismatch`)
      continue
    }

    // Basic numeric validation
    let rowValid = true
    for (let j = 0; j < values.length; j++) {
      const value = values[j]
      if (value && isNaN(Number.parseFloat(value))) {
        warnings.push(`Row ${i}: Non-numeric value "${value}" in column ${headers[j]}`)
        rowValid = false
      }
    }

    if (rowValid) validRecordCount++
  }

  if (validRecordCount === 0) {
    errors.push("No valid records found in dataset")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.slice(0, 5),
    recordCount: validRecordCount,
  }
}
