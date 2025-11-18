// Generate a 500-entry sepsis dataset with mixed predictions (70% Sepsis, 10% Borderline, 20% No Sepsis)

interface DataRow {
  ID: number
  HR: number
  O2Sat: number
  Temp: number
  SBP: number
  MAP: number
  DBP: number
  Resp: number
  EtCO2: number
  BaseExcess: number
  HCO3: number
  FiO2: number
  KCal: number
  Glucose: number
  Magnesium: number
  Phosphate: number
  Potassium: number
  Bilirubin_total: number
  Calcium: number
  Chloride: number
  Creatinine: number
  DiasBP: number
  Platelets_initial: number
  PO2: number
  RespRate: number
  SaO2: number
  Sodium: number
  Urine: number
  WBC: number
}

function generateSepsisPositiveEntry(id: number): DataRow {
  return {
    ID: id,
    HR: 110 + Math.random() * 30,
    O2Sat: 88 + Math.random() * 8,
    Temp: 35 + Math.random() * 3,
    SBP: 80 + Math.random() * 20,
    MAP: 50 + Math.random() * 15,
    DBP: 35 + Math.random() * 15,
    Resp: 24 + Math.random() * 10,
    EtCO2: 20 + Math.random() * 12,
    BaseExcess: -3 + Math.random() * 4,
    HCO3: 8 + Math.random() * 8,
    FiO2: 0.21 + Math.random() * 0.5,
    KCal: 1000 + Math.random() * 500,
    Glucose: 70 + Math.random() * 40,
    Magnesium: 3.5 + Math.random() * 1.5,
    Phosphate: 0.3 + Math.random() * 0.8,
    Potassium: 4.3 + Math.random() * 1,
    Bilirubin_total: 1.2 + Math.random() * 1,
    Calcium: 6 + Math.random() * 1.5,
    Chloride: 88 + Math.random() * 8,
    Creatinine: 1.8 + Math.random() * 1,
    DiasBP: 35 + Math.random() * 15,
    Platelets_initial: 150 + Math.random() * 100,
    PO2: 60 + Math.random() * 25,
    RespRate: 24 + Math.random() * 12,
    SaO2: 80 + Math.random() * 15,
    Sodium: 120 + Math.random() * 20,
    Urine: 200 + Math.random() * 400,
    WBC: 17 + Math.random() * 5,
  }
}

function generateNormalEntry(id: number): DataRow {
  return {
    ID: id,
    HR: 70 + Math.random() * 20,
    O2Sat: 95 + Math.random() * 4,
    Temp: 36.5 + Math.random() * 1.5,
    SBP: 110 + Math.random() * 20,
    MAP: 70 + Math.random() * 15,
    DBP: 55 + Math.random() * 15,
    Resp: 14 + Math.random() * 6,
    EtCO2: 35 + Math.random() * 8,
    BaseExcess: 2 + Math.random() * 2,
    HCO3: 23 + Math.random() * 4,
    FiO2: 0.21,
    KCal: 1700 + Math.random() * 400,
    Glucose: 110 + Math.random() * 30,
    Magnesium: 1.8 + Math.random() * 0.5,
    Phosphate: 1.1 + Math.random() * 0.4,
    Potassium: 3.6 + Math.random() * 0.6,
    Bilirubin_total: 0.6 + Math.random() * 0.4,
    Calcium: 8.5 + Math.random() * 0.8,
    Chloride: 100 + Math.random() * 6,
    Creatinine: 0.8 + Math.random() * 0.3,
    DiasBP: 55 + Math.random() * 15,
    Platelets_initial: 240 + Math.random() * 50,
    PO2: 90 + Math.random() * 15,
    RespRate: 14 + Math.random() * 8,
    SaO2: 96 + Math.random() * 3,
    Sodium: 138 + Math.random() * 4,
    Urine: 1200 + Math.random() * 300,
    WBC: 8 + Math.random() * 3,
  }
}

function generateBorderlineEntry(id: number): DataRow {
  return {
    ID: id,
    HR: 95 + Math.random() * 25,
    O2Sat: 92 + Math.random() * 6,
    Temp: 35.5 + Math.random() * 2.5,
    SBP: 95 + Math.random() * 25,
    MAP: 60 + Math.random() * 18,
    DBP: 45 + Math.random() * 18,
    Resp: 19 + Math.random() * 10,
    EtCO2: 28 + Math.random() * 12,
    BaseExcess: -1 + Math.random() * 3,
    HCO3: 16 + Math.random() * 10,
    FiO2: 0.21 + Math.random() * 0.3,
    KCal: 1350 + Math.random() * 450,
    Glucose: 90 + Math.random() * 50,
    Magnesium: 2.2 + Math.random() * 0.8,
    Phosphate: 0.7 + Math.random() * 0.6,
    Potassium: 4 + Math.random() * 0.8,
    Bilirubin_total: 0.9 + Math.random() * 0.6,
    Calcium: 7.5 + Math.random() * 1,
    Chloride: 94 + Math.random() * 10,
    Creatinine: 1.2 + Math.random() * 0.6,
    DiasBP: 45 + Math.random() * 18,
    Platelets_initial: 200 + Math.random() * 80,
    PO2: 75 + Math.random() * 30,
    RespRate: 19 + Math.random() * 12,
    SaO2: 91 + Math.random() * 7,
    Sodium: 130 + Math.random() * 12,
    Urine: 700 + Math.random() * 500,
    WBC: 12 + Math.random() * 5,
  }
}

// Generate 500 entries: 350 sepsis (70%), 50 borderline (10%), 100 normal (20%)
const dataset: DataRow[] = []
let id = 1

// Sepsis cases (350 entries)
for (let i = 0; i < 350; i++) {
  dataset.push(generateSepsisPositiveEntry(id++))
}

// Borderline cases (50 entries)
for (let i = 0; i < 50; i++) {
  dataset.push(generateBorderlineEntry(id++))
}

// Normal cases (100 entries)
for (let i = 0; i < 100; i++) {
  dataset.push(generateNormalEntry(id++))
}

// Output as CSV
const headers = Object.keys(dataset[0]).join(",")
const rows = dataset.map((row) =>
  Object.values(row)
    .map((val) => (typeof val === "number" ? val.toFixed(1) : val))
    .join(","),
)

console.log([headers, ...rows].join("\n"))
