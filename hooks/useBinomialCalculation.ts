"use client"

import { useMemo } from "react"

interface ExperimentData {
  trial: number
  results: number[]
  successes: number
  timestamp: Date
}

interface ExperimentConfig {
  numDice: number
  successCriteria: number[]
  numTrials: number
}

export function useBinomialCalculation(experimentData: ExperimentData[], config: ExperimentConfig) {
  const calculations = useMemo(() => {
    // Probabilidad de éxito en un solo dado
    const singleDiceProbability = config.successCriteria.length / 6

    // Probabilidad teórica de éxito (al menos un éxito en n dados)
    const theoreticalProbability = 1 - Math.pow(1 - singleDiceProbability, config.numDice)

    // Probabilidad observada
    const totalTrials = experimentData.length
    const totalSuccesses = experimentData.reduce((sum, trial) => sum + (trial.successes > 0 ? 1 : 0), 0)
    const observedProbability = totalTrials > 0 ? totalSuccesses / totalTrials : 0

    // Estadísticas binomiales
    const n = config.numTrials
    const p = theoreticalProbability

    const binomialStats = {
      mean: n * p,
      variance: n * p * (1 - p),
      standardDeviation: Math.sqrt(n * p * (1 - p)),
    }

    // Intervalo de confianza (95%)
    const z = 1.96 // Para 95% de confianza
    const standardError = Math.sqrt((p * (1 - p)) / Math.max(totalTrials, 1))

    const confidenceInterval = {
      lower: Math.max(0, p - z * standardError),
      upper: Math.min(1, p + z * standardError),
      confidence: 95,
    }

    return {
      theoreticalProbability,
      observedProbability,
      binomialStats,
      confidenceInterval,
    }
  }, [experimentData, config])

  return calculations
}
