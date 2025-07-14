"use client"

import { useState } from 'react'

interface BinomialDistribution {
  k: number
  probability: number
  cumulativeProbability: number
}

interface StatisticsPanelProps {
  binomialDistribution: BinomialDistribution[]
  theoreticalProbabilityForK: (k: number) => number
  observedProbability: number
  binomialStats: {
    n: number
    p: number
    q: number
    mean: number
    variance: number
    standardDeviation: number
    observedSuccesses: number
    totalTrials: number
  }
  confidenceInterval: {
    lower: number
    upper: number
    confidence: number
  }
  parameters: {
    n: number
    p: number
    q: number
  }
  experimentData: Array<{
    trial: number
    results: number[]
    successes: number
    timestamp: Date
  }>
  experimentConfig: {
    numDice: number
    successCriteria: number[]
    numTrials: number
  }
}

export default function StatisticsPanel({
  theoreticalProbabilityForK,
  observedProbability,
  binomialStats,
  confidenceInterval,
  parameters,
  experimentData,
  experimentConfig,
}: StatisticsPanelProps) {
  const [calculatorK, setCalculatorK] = useState<string>('')
  const totalTrials = experimentData.length
  const totalSuccesses = experimentData.reduce((sum, trial) => sum + (trial.successes > 0 ? 1 : 0), 0)

  // Calcular la distribución de éxitos observados - TODOS los valores únicos de k
  const getObservedSuccessDistribution = () => {
    const distribution = new Map<number, number>()
    
    // Obtener TODOS los valores únicos de successes que aparecen en los datos
    experimentData.forEach(trial => {
      const successes = trial.successes
      distribution.set(successes, (distribution.get(successes) || 0) + 1)
    })
    
    // Convertir el Map a array y ordenar por k
    return Array.from(distribution.entries())
      .map(([k, frequency]) => ({
        k,
        frequency,
        observedProbability: totalTrials > 0 ? frequency / totalTrials : 0,
        theoreticalProbability: theoreticalProbabilityForK(k)
      }))
      .sort((a, b) => a.k - b.k)
  }

  const observedDistribution = getObservedSuccessDistribution()

  const calculateChiSquare = () => {
    if (totalTrials === 0) return 0

    const expected = totalTrials * parameters.p
    const observed = totalSuccesses

    return Math.pow(observed - expected, 2) / expected
  }

  const getConvergenceAnalysis = () => {
    if (experimentData.length < 10) return "Insuficientes datos"

    const recentTrials = experimentData.slice(-10)
    const recentSuccessRate = recentTrials.reduce((sum, trial) => sum + (trial.successes > 0 ? 1 : 0), 0) / recentTrials.length

    const difference = Math.abs(recentSuccessRate - parameters.p)

    if (difference < 0.05) return "Excelente convergencia"
    if (difference < 0.1) return "Buena convergencia"
    if (difference < 0.2) return "Convergencia moderada"
    return "Convergencia lenta"
  }

  // Función para calcular coeficiente binomial C(n,k)
  const binomialCoefficient = (n: number, k: number): number => {
    if (k > n || k < 0) return 0
    if (k === 0 || k === n) return 1
    
    let result = 1
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1)
    }
    return result
  }

  // Función para calcular probabilidad binomial P(X = k)
  const calculateBinomialProbability = (k: number): number => {
    const n = parameters.n
    const p = parameters.p
    const q = parameters.q
    
    if (k > n || k < 0) return 0
    
    const coefficient = binomialCoefficient(n, k)
    const probability = coefficient * Math.pow(p, k) * Math.pow(q, n - k)
    
    return probability
  }

  // Obtener resultado de la calculadora
  const getCalculatorResult = () => {
    const k = parseInt(calculatorK)
    if (isNaN(k) || k < 0 || k > parameters.n) return null
    
    return {
      k,
      probability: calculateBinomialProbability(k),
      percentage: (calculateBinomialProbability(k) * 100).toFixed(6)
    }
  }

  const calculatorResult = getCalculatorResult()

  return (
    <div className="space-y-6">
      {/* Configuración del Experimento */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
          Configuración del Experimento
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Número de Dados:</span>
            <p className="font-mono text-indigo-600 dark:text-indigo-400">{experimentConfig.numDice}</p>
          </div>
          <div>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Criterios de Éxito:</span>
            <p className="font-mono text-indigo-600 dark:text-indigo-400">{experimentConfig.successCriteria.join(", ")}</p>
          </div>
          <div>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Intentos Configurados:</span>
            <p className="font-mono text-indigo-600 dark:text-indigo-400">{experimentConfig.numTrials}</p>
          </div>
          <div>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Intentos Realizados:</span>
            <p className="font-mono text-indigo-600 dark:text-indigo-400">{totalTrials}</p>
          </div>
        </div>
        
        <h5 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Parámetros de la Distribución Binomial</h5>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">n = {parameters.n}</span>
            <p className="text-xs text-indigo-500">Número de ensayos</p>
          </div>
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">p = {parameters.p.toFixed(4)}</span>
            <p className="text-xs text-indigo-500">Probabilidad de éxito ({experimentConfig.successCriteria.length}/6)</p>
          </div>
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">q = {parameters.q.toFixed(4)}</span>
            <p className="text-xs text-indigo-500">Probabilidad de fracaso ({6 - experimentConfig.successCriteria.length}/6)</p>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Éxitos Observados</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {binomialStats.observedSuccesses}
          </p>
          <p className="text-sm text-blue-500">de {binomialStats.totalTrials} ensayos</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200">Probabilidad Observada</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalTrials > 0 ? (observedProbability * 100).toFixed(2) : 0}%
          </p>
        </div>
      </div>

      {/* Estadísticas binomiales */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Estadísticas de Distribución Binomial</h4>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Media (μ = n × p):</span>
            <span className="font-mono">{binomialStats.mean.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Varianza (σ² = n × p × q):</span>
            <span className="font-mono">{binomialStats.variance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Desviación Estándar (σ):</span>
            <span className="font-mono">{binomialStats.standardDeviation.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Calculadora de Probabilidad Binomial */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
          Calculadora de Probabilidad Binomial
        </h4>
        
        <div className="mb-4">
          <div className="text-sm text-amber-700 dark:text-amber-300 mb-2">
            <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
              P(X = k) = C(n,k) × p^k × q^(n-k)
            </span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400">
            Con n = {parameters.n}, p = {parameters.p.toFixed(4)}, q = {parameters.q.toFixed(4)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
              Valor de k (0 ≤ k ≤ {parameters.n}):
            </label>
            <input
              type="number"
              min="0"
              max={parameters.n}
              value={calculatorK}
              onChange={(e) => setCalculatorK(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ingresa un valor de k"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
              Resultado:
            </label>
            <div className="h-10 px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center">
              {calculatorResult ? (
                <span className="font-mono text-amber-800 dark:text-amber-200">
                  P(X = {calculatorResult.k}) = {calculatorResult.probability.toFixed(8)}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 text-sm">
                  Ingresa un valor válido de k
                </span>
              )}
            </div>
          </div>
        </div>

        {calculatorResult && (
          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-300">Probabilidad decimal:</span>
                <span className="font-mono text-amber-800 dark:text-amber-200">
                  {calculatorResult.probability.toFixed(8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-300">Probabilidad porcentual:</span>
                <span className="font-mono text-amber-800 dark:text-amber-200">
                  {calculatorResult.percentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-300">Coeficiente binomial C({parameters.n},{calculatorResult.k}):</span>
                <span className="font-mono text-amber-800 dark:text-amber-200">
                  {binomialCoefficient(parameters.n, calculatorResult.k).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intervalo de confianza */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
          Intervalo de Confianza ({confidenceInterval.confidence}%)
        </h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Límite Inferior:</span>
            <span className="font-mono">{(confidenceInterval.lower * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Límite Superior:</span>
            <span className="font-mono">{(confidenceInterval.upper * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Resumen del experimento */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Resumen del Experimento</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total de Intentos:</span>
            <p className="font-semibold">{totalTrials}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total de Éxitos:</span>
            <p className="font-semibold">{totalSuccesses}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Diferencia:</span>
            <p
              className={`font-semibold ${
                Math.abs(observedProbability - parameters.p) < 0.05 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalTrials > 0 ? `${((observedProbability - parameters.p) * 100).toFixed(2)}%` : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Última Actualización:</span>
            <p className="font-semibold text-xs">
              {experimentData.length > 0
                ? experimentData[experimentData.length - 1].timestamp.toLocaleTimeString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
