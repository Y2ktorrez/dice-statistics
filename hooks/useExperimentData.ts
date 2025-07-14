"use client"

import { useState, useCallback } from "react"

interface ExperimentData {
  trial: number
  results: number[]
  successes: number
  timestamp: Date
}

interface ExperimentConfig {
  successCriteria: number[]
}

export function useExperimentData(config: ExperimentConfig) {
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([])
  const [currentTrial, setCurrentTrial] = useState(0)

  const addResult = useCallback(
    (results: number[]) => {
      const newTrial = currentTrial + 1
      const successes = results.filter((result) => config.successCriteria.includes(result)).length

      const newData: ExperimentData = {
        trial: newTrial,
        results,
        successes,
        timestamp: new Date(),
      }

      setExperimentData((prev) => [...prev, newData])
      setCurrentTrial(newTrial)
    },
    [currentTrial, config.successCriteria],
  )

  const resetExperiment = useCallback(() => {
    setExperimentData([])
    setCurrentTrial(0)
  }, [])

  const exportData = useCallback((stats?: Record<string, any>) => {
    if (experimentData.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    const csvRows = [
      "Intento,Resultados,Exitos",
      ...experimentData.map(
        (data) => `${data.trial},"${data.results.join(";")}",${data.successes}`,
      ),
    ]

    if (stats) {
      csvRows.push("")
      csvRows.push("RESULTADOS ESTADISTICOS DE LA DISTRIBUCION BINOMIAL")
      csvRows.push("")
      
      // Parámetros de la distribución
      if (stats.parameters) {
        csvRows.push("Parametros de la Distribucion Binomial:")
        csvRows.push(`n (numero de ensayos),${stats.parameters.n}`)
        csvRows.push(`p (probabilidad de exito),${stats.parameters.p}`)
        csvRows.push(`q (probabilidad de fracaso),${stats.parameters.q}`)
        csvRows.push("")
      }

      // Estadísticas binomiales
      if (stats.binomialStats) {
        csvRows.push("Estadisticas Binomiales:")
        csvRows.push(`Media,${stats.binomialStats.mean}`)
        csvRows.push(`Varianza,${stats.binomialStats.variance}`)
        csvRows.push(`Desviacion Estandar,${stats.binomialStats.standardDeviation}`)
        csvRows.push(`Exitos Observados,${stats.binomialStats.observedSuccesses}`)
        csvRows.push("")
      }
    }

    const csvContent = csvRows.join("\n")

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
