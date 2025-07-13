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

interface BinomialDistribution {
  k: number
  probability: number
  cumulativeProbability: number
}

export function useBinomialCalculation(experimentData: ExperimentData[], config: ExperimentConfig) {
  const calculations = useMemo(() => {
    // Parámetros de la distribución binomial DINÁMICOS
    const n = config.numTrials || experimentData.length // número de ensayos
    const p = config.successCriteria.length / 6 // probabilidad de éxito basada en criterios definidos
    const q = 1 - p // probabilidad de fracaso

    // Función para calcular el coeficiente binomial C(n,k) = n! / (k! * (n-k)!)
    const binomialCoefficient = (n: number, k: number): number => {
      if (k > n || k < 0) return 0
      if (k === 0 || k === n) return 1
      
      let result = 1
      for (let i = 0; i < k; i++) {
        result = result * (n - i) / (i + 1)
      }
      return result
    }

    // Calcular la distribución binomial teórica completa
    const binomialDistribution: BinomialDistribution[] = []
    let cumulativeSum = 0
    
    for (let k = 0; k <= n; k++) {
      const coefficient = binomialCoefficient(n, k)
      const probability = coefficient * Math.pow(p, k) * Math.pow(q, n - k)
      cumulativeSum += probability
      
      binomialDistribution.push({
        k,
        probability,
        cumulativeProbability: cumulativeSum
      })
    }

    // Contar éxitos observados
    const observedSuccesses = experimentData.filter(trial => trial.successes > 0).length
    const totalTrials = experimentData.length
    const observedProbability = totalTrials > 0 ? observedSuccesses / totalTrials : 0

    // Estadísticas binomiales
    const binomialStats = {
      n: n,
      p: p,
      q: q,
      mean: n * p,
      variance: n * p * q,
      standardDeviation: Math.sqrt(n * p * q),
      observedSuccesses: observedSuccesses,
      totalTrials: totalTrials
    }

    // Probabilidad teórica de obtener exactamente k éxitos
    const theoreticalProbabilityForK = (k: number): number => {
      if (k < 0 || k > n) return 0
      return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(q, n - k)
    }

    // Intervalo de confianza (95%)
    const z = 1.96
    const standardError = Math.sqrt((p * q) / Math.max(totalTrials, 1))
    const confidenceInterval = {
      lower: Math.max(0, p - z * standardError),
      upper: Math.min(1, p + z * standardError),
      confidence: 95,
    }

    return {
      binomialDistribution,
      theoreticalProbabilityForK,
      observedProbability,
      binomialStats,
      confidenceInterval,
      parameters: {
        n,
        p,
        q
      }
    }
  }, [experimentData, config])

  return calculations
}
