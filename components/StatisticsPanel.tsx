"use client"

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
}

export default function StatisticsPanel({
  binomialDistribution,
  theoreticalProbabilityForK,
  observedProbability,
  binomialStats,
  confidenceInterval,
  parameters,
  experimentData,
}: StatisticsPanelProps) {
  const totalTrials = experimentData.length
  const totalSuccesses = experimentData.reduce((sum, trial) => sum + (trial.successes > 0 ? 1 : 0), 0)

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

  return (
    <div className="space-y-6">
      {/* Parámetros de la distribución */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
          Parámetros de la Distribución Binomial
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">n = {parameters.n}</span>
            <p className="text-xs text-indigo-500">Número de ensayos</p>
          </div>
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">p = {parameters.p.toFixed(4)}</span>
            <p className="text-xs text-indigo-500">Probabilidad de éxito ({(parameters.p * 6).toFixed(0)}/6)</p>
          </div>
          <div className="text-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg">q = {parameters.q.toFixed(4)}</span>
            <p className="text-xs text-indigo-500">Probabilidad de fracaso ({(parameters.q * 6).toFixed(0)}/6)</p>
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

      {/* Distribución binomial teórica completa */}
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">
          Distribución Binomial Teórica Completa
        </h4>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          P(X = k) = C(n,k) × ({parameters.p.toFixed(4)})^k × ({parameters.q.toFixed(4)})^(n-k)
        </p>
        <div className="max-h-40 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1">k</th>
                <th className="text-right p-1">P(X = k)</th>
                <th className="text-right p-1">P(X ≤ k)</th>
              </tr>
            </thead>
            <tbody>
              {binomialDistribution.map((item) => (
                <tr key={item.k} className="border-b border-gray-200">
                  <td className="p-1 font-mono">{item.k}</td>
                  <td className="p-1 font-mono text-right">{item.probability.toFixed(6)}</td>
                  <td className="p-1 font-mono text-right">{item.cumulativeProbability.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
