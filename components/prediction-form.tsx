"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface PredictionFormProps {
  onSubmit: (data: any) => void
  loading: boolean
}

export function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    temperature: "",
    heart_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    respiratory_rate: "",
    wbc_count: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card className="p-6 border border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Temperature (°C)</label>
          <Input
            type="number"
            name="temperature"
            placeholder="36.5"
            step="0.1"
            value={formData.temperature}
            onChange={handleChange}
            required
            className="bg-input border-border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Heart Rate (bpm)</label>
          <Input
            type="number"
            name="heart_rate"
            placeholder="72"
            value={formData.heart_rate}
            onChange={handleChange}
            required
            className="bg-input border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Systolic BP (mmHg)</label>
            <Input
              type="number"
              name="systolic_bp"
              placeholder="120"
              value={formData.systolic_bp}
              onChange={handleChange}
              required
              className="bg-input border-border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Diastolic BP (mmHg)</label>
            <Input
              type="number"
              name="diastolic_bp"
              placeholder="80"
              value={formData.diastolic_bp}
              onChange={handleChange}
              required
              className="bg-input border-border"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Respiratory Rate (breaths/min)</label>
          <Input
            type="number"
            name="respiratory_rate"
            placeholder="16"
            value={formData.respiratory_rate}
            onChange={handleChange}
            required
            className="bg-input border-border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">White Blood Cell Count (K/µL)</label>
          <Input
            type="number"
            name="wbc_count"
            placeholder="7.5"
            step="0.1"
            value={formData.wbc_count}
            onChange={handleChange}
            required
            className="bg-input border-border"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? "Predicting..." : "Get Prediction"}
        </Button>
      </form>
    </Card>
  )
}
