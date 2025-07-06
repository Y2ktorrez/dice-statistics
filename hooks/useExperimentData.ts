"use client"

import { useState, useCallback } from "react"

interface ExperimentData {
  trial: number
  results: number[]
  successes: number
  timestamp: Date
}

export function useExperimentData() {
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([])
  const [currentTrial, setCurrentTrial] = useState(0)

  const addResult = useCallback(
    (results: number[]) => {
      const newTrial = currentTrial + 1
      const successes = results.filter((result) => result >= 5).length // Ejemplo: éxito si es 5 o 6

      const newData: ExperimentData = {
        trial: newTrial,
        results,
        successes,
        timestamp: new Date(),
      }

      setExperimentData((prev) => [...prev, newData])
      setCurrentTrial(newTrial)
    },
    [currentTrial],
  )

  const resetExperiment = useCallback(() => {
    setExperimentData([])
    setCurrentTrial(0)
  }, [])

  const exportData = useCallback(() => {
    if (experimentData.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    const csvContent = [
      "Intento,Resultados,Éxitos,Timestamp",
      ...experimentData.map(
        (data) => `${data.trial},"${data.results.join(";")}",${data.successes},${data.timestamp.toISOString()}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `experimento_dados_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [experimentData])

  return {
    experimentData,
    currentTrial,
    addResult,
    resetExperiment,
    exportData,
  }
}
