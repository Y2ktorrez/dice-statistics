"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"

interface ChartsDisplayProps {
  experimentData: Array<{
    trial: number
    results: number[]
    successes: number
    timestamp: Date
  }>
  theoreticalProbability: number
  config: {
    numDice: number
    successCriteria: number[]
    numTrials: number
  }
}

export default function ChartsDisplay({ experimentData, theoreticalProbability, config }: ChartsDisplayProps) {
  // Datos para gráfico de convergencia
  const convergenceData = experimentData.map((trial, index) => {
    const cumulativeSuccesses = experimentData.slice(0, index + 1).reduce((sum, t) => sum + t.successes, 0)
    const cumulativeTrials = index + 1
    const observedProbability = cumulativeSuccesses / cumulativeTrials

    return {
      trial: trial.trial,
      observedProbability: observedProbability * 100,
      theoreticalProbability: theoreticalProbability * 100,
      difference: Math.abs(observedProbability - theoreticalProbability) * 100,
    }
  })

  // Datos para histograma de distribución
  const distributionData = Array.from({ length: config.numDice + 1 }, (_, i) => {
    const successCount = i
    const frequency = experimentData.filter((trial) => trial.successes === successCount).length
    const probability = experimentData.length > 0 ? frequency / experimentData.length : 0

    // Probabilidad teórica binomial
    const binomialCoeff =
      factorial(config.numDice) / (factorial(successCount) * factorial(config.numDice - successCount))
    const theoreticalProb =
      binomialCoeff *
      Math.pow(theoreticalProbability, successCount) *
      Math.pow(1 - theoreticalProbability, config.numDice - successCount)

    return {
      successes: successCount,
      observed: probability * 100,
      theoretical: theoreticalProb * 100,
      frequency,
    }
  })

  // Datos para análisis temporal
  const temporalData = experimentData.map((trial) => ({
    trial: trial.trial,
    successes: trial.successes,
    timestamp: trial.timestamp.getTime(),
  }))

  return (
    <div className="space-y-8">
      {/* Gráfico de Convergencia */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Convergencia de Probabilidades</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trial" label={{ value: "Número de Intentos", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Probabilidad (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`,
                  name === "observedProbability"
                    ? "Observada"
                    : name === "theoreticalProbability"
                      ? "Teórica"
                      : "Diferencia",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="observedProbability"
                stroke="#2563eb"
                strokeWidth={2}
                name="Probabilidad Observada"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="theoreticalProbability"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Probabilidad Teórica"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histograma de Distribución */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Distribución de Éxitos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="successes" label={{ value: "Número de Éxitos", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Probabilidad (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}%`,
                  name === "observed" ? "Observada" : "Teórica",
                ]}
              />
              <Legend />
              <Bar dataKey="observed" fill="#3b82f6" name="Frecuencia Observada" opacity={0.8} />
              <Bar dataKey="theoretical" fill="#ef4444" name="Frecuencia Teórica" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Resumen Estadístico de Gráficos</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Máx. Diferencia:</span>
            <p className="font-semibold">
              {convergenceData.length > 0
                ? `${Math.max(...convergenceData.map((d) => d.difference)).toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Mín. Diferencia:</span>
            <p className="font-semibold">
              {convergenceData.length > 0
                ? `${Math.min(...convergenceData.map((d) => d.difference)).toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Éxito Más Frecuente:</span>
            <p className="font-semibold">
              {distributionData.length > 0
                ? distributionData.reduce((max, curr) => (curr.frequency > max.frequency ? curr : max)).successes
                : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Variabilidad:</span>
            <p className="font-semibold">
              {temporalData.length > 0 ? calculateVariability(temporalData.map((d) => d.successes)).toFixed(3) : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar para calcular factorial
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

// Función auxiliar para calcular variabilidad
function calculateVariability(data: number[]): number {
  if (data.length === 0) return 0

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length

  return Math.sqrt(variance)
}
