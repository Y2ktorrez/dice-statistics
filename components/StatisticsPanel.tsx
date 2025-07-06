"use client"

interface StatisticsPanelProps {
  theoreticalProbability: number
  observedProbability: number
  binomialStats: {
    mean: number
    variance: number
    standardDeviation: number
  }
  confidenceInterval: {
    lower: number
    upper: number
    confidence: number
  }
  experimentData: Array<{
    trial: number
    results: number[]
    successes: number
    timestamp: Date
  }>
}

export default function StatisticsPanel({
  theoreticalProbability,
  observedProbability,
  binomialStats,
  confidenceInterval,
  experimentData,
}: StatisticsPanelProps) {
  const totalTrials = experimentData.length
  const totalSuccesses = experimentData.reduce((sum, trial) => sum + trial.successes, 0)

  const calculateChiSquare = () => {
    if (totalTrials === 0) return 0

    const expected = totalTrials * theoreticalProbability
    const observed = totalSuccesses

    return Math.pow(observed - expected, 2) / expected
  }

  const getConvergenceAnalysis = () => {
    if (experimentData.length < 10) return "Insuficientes datos"

    const recentTrials = experimentData.slice(-10)
    const recentSuccessRate = recentTrials.reduce((sum, trial) => sum + trial.successes, 0) / recentTrials.length

    const difference = Math.abs(recentSuccessRate - theoreticalProbability)

    if (difference < 0.05) return "Excelente convergencia"
    if (difference < 0.1) return "Buena convergencia"
    if (difference < 0.2) return "Convergencia moderada"
    return "Convergencia lenta"
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Probabilidad Teórica</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(theoreticalProbability * 100).toFixed(2)}%
          </p>
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
            <span>Media (μ):</span>
            <span className="font-mono">{binomialStats.mean.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Varianza (σ²):</span>
            <span className="font-mono">{binomialStats.variance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Desviación Estándar (σ):</span>
            <span className="font-mono">{binomialStats.standardDeviation.toFixed(4)}</span>
          </div>
        </div>
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

      {/* Análisis de convergencia */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Análisis de Convergencia</h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">{getConvergenceAnalysis()}</p>
        <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
          Chi-cuadrado: {calculateChiSquare().toFixed(4)}
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
                Math.abs(observedProbability - theoreticalProbability) < 0.05 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalTrials > 0 ? `${((observedProbability - theoreticalProbability) * 100).toFixed(2)}%` : "N/A"}
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
