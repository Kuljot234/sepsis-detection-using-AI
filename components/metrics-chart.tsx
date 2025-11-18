"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MetricsData {
  [key: string]: {
    accuracy: number
    precision: number
    recall: number
    f1: number
  }
}

export function MetricsChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics")
        if (!response.ok) {
          throw new Error("Failed to fetch metrics")
        }
        const metricsData: MetricsData = await response.json()

        const chartData = Object.entries(metricsData).map(([model, values]) => ({
          name: model,
          Accuracy: values.accuracy,
          Precision: values.precision,
          Recall: values.recall,
          F1: values.f1,
        }))

        setData(chartData)
      } catch (err) {
        console.error("Error fetching metrics:", err)
        // Fallback to hardcoded data if API fails
        setData([
          {
            name: "Logistic Regression",
            Accuracy: 0.87,
            Precision: 0.85,
            Recall: 0.89,
            F1: 0.87,
          },
          {
            name: "Decision Tree",
            Accuracy: 0.89,
            Precision: 0.88,
            Recall: 0.9,
            F1: 0.89,
          },
          {
            name: "Random Forest",
            Accuracy: 0.93,
            Precision: 0.92,
            Recall: 0.94,
            F1: 0.93,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Loading chart...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
        <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: `1px solid var(--color-border)`,
            borderRadius: "8px",
          }}
          labelStyle={{ color: "var(--color-foreground)" }}
        />
        <Legend />
        <Bar dataKey="Accuracy" fill="var(--color-chart-1)" />
        <Bar dataKey="Precision" fill="var(--color-chart-2)" />
        <Bar dataKey="Recall" fill="var(--color-chart-3)" />
        <Bar dataKey="F1" fill="var(--color-chart-4)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
