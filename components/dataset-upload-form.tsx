"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DatasetUploadFormProps {
  onUpload: (file: File) => void
  loading: boolean
}

export function DatasetUploadForm({ onUpload, loading }: DatasetUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith(".csv")) {
        alert("Please select a CSV file")
        return
      }
      onUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add("bg-primary/10", "border-primary")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-primary/10", "border-primary")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-primary/10", "border-primary")

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.name.endsWith(".csv")) {
        alert("Please drop a CSV file")
        return
      }
      onUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition hover:border-primary/50 hover:bg-primary/5"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm font-medium text-foreground mb-1">Drag and drop your CSV file</p>
        <p className="text-xs text-muted-foreground">or click to browse</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </div>

      <Button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full">
        {loading ? "Processing..." : "Select File"}
      </Button>

      <Alert className="bg-accent/10 border-accent/20">
        <AlertDescription className="text-sm text-accent-foreground">
          <p className="font-semibold mb-2">Supported columns (case-insensitive):</p>
          <p className="text-xs">
            age, anaemia, creatinine_phosphokinase, diabetes, ejection_fraction, high_blood_pressure, platelets,
            serum_creatinine, serum_sodium, sex, smoking, time, DEATH_EVENT
          </p>
          <p className="text-xs mt-1">Missing values will be handled automatically</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
