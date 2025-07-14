"use client"

import { useMemo } from "react"
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
  // Optimizar con useMemo para evitar recalcular datos innecesariamente
  const convergenceData = useMemo(() => {
    return experimentData.map((trial, index) => {
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
  }, [experimentData, theoreticalProbability])

  // Datos para histograma de distribución
  const distributionData = useMemo(() => {
    return Array.from({ length: config.numDice + 1 }, (_, i) => {
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
  }, [experimentData, theoreticalProbability, config])

  // Datos para análisis temporal
  const temporalData = useMemo(() => {
    return experimentData.map((trial) => ({
      trial: trial.trial,
      successes: trial.successes,
      timestamp: trial.timestamp.getTime(),
    }))
  }, [experimentData])

  return (
    <div className="space-y-8">
      {/* Gráfico de Convergencia */}
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Convergencia de Probabilidades</h3>
          
          {/* Explicación teórica */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📊 Teoría: Ley de los Grandes Números
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Este gráfico demuestra la <strong>Ley de los Grandes Números</strong>, un principio fundamental en estadística que establece que cuando el número de experimentos aumenta, la probabilidad observada converge hacia la probabilidad teórica.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-600"></div>
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Línea Azul (Observada):</strong> Probabilidad calculada de tus experimentos reales
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-600 border-dashed border-t-2 border-red-600"></div>
                <span className="text-blue-700 dark:text-blue-300">
                  <strong>Línea Roja (Teórica):</strong> Probabilidad calculada matemáticamente ({(theoreticalProbability * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
              💡 <strong>Interpretación:</strong> Con pocos experimentos habrá mucha variación, pero conforme aumenten los lanzamientos, las líneas deberían acercarse.
            </p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={convergenceData} key={`convergence-${experimentData.length}`}>
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
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="theoreticalProbability"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Probabilidad Teórica"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histograma de Distribución */}
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Éxitos</h3>
          
          {/* Explicación teórica */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              📈 Teoría: Distribución Binomial
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Este histograma muestra la <strong>Distribución Binomial</strong>, que describe la probabilidad de obtener exactamente k éxitos en n ensayos independientes, donde cada ensayo tiene una probabilidad p de éxito.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                <span className="text-green-700 dark:text-green-300">
                  <strong>Barras Azules (Observada):</strong> Frecuencia real de éxitos en tus experimentos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-sm opacity-60"></div>
                <span className="text-green-700 dark:text-green-300">
                  <strong>Barras Rojas (Teórica):</strong> Frecuencia esperada según la fórmula binomial
                </span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-md mt-3">
              <p className="text-xs text-green-800 dark:text-green-200 font-mono">
                P(X = k) = C(n,k) × p^k × (1-p)^(n-k)
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Donde: n = {config.numDice} dados, p = {(theoreticalProbability * 100).toFixed(1)}% probabilidad de éxito
              </p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-3">
              💡 <strong>Interpretación:</strong> Las barras azules y rojas deberían tener alturas similares si el experimento es justo y representa bien la teoría.
            </p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} key={`distribution-${experimentData.length}`}>
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
              <Bar dataKey="observed" fill="#3b82f6" name="Frecuencia Observada" opacity={0.8} isAnimationActive={false} />
              <Bar dataKey="theoretical" fill="#ef4444" name="Frecuencia Teórica" opacity={0.6} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">📊 Análisis e Interpretación de los Gráficos</h4>
        
        {/* Explicación de las métricas */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
          <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🔍 Guía de Interpretación</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Máx/Mín Diferencia:</strong> Indica qué tan lejos has estado de la probabilidad teórica. Valores bajos = mejor convergencia.
              </p>
            </div>
            <div>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Éxito Más Frecuente:</strong> El número de éxitos que más veces has obtenido en tus experimentos.
              </p>
            </div>
            <div>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Variabilidad:</strong> Qué tan dispersos están tus resultados. Menor variabilidad = mayor consistencia.
              </p>
            </div>
            <div>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Calidad del Experimento:</strong> Evaluación general basada en la convergencia y consistencia.
              </p>
            </div>
          </div>
        </div>

        {/* Métricas calculadas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Máx. Diferencia:</span>
            <p className="font-semibold text-lg">
              {convergenceData.length > 0
                ? `${Math.max(...convergenceData.map((d) => d.difference)).toFixed(2)}%`
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {convergenceData.length > 0 
                ? Math.max(...convergenceData.map((d) => d.difference)) > 20 
                  ? "📈 Alta variación" 
                  : Math.max(...convergenceData.map((d) => d.difference)) > 10 
                    ? "📊 Variación moderada" 
                    : "✅ Baja variación"
                : "Esperando datos..."}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Mín. Diferencia:</span>
            <p className="font-semibold text-lg">
              {convergenceData.length > 0
                ? `${Math.min(...convergenceData.map((d) => d.difference)).toFixed(2)}%`
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {convergenceData.length > 0 
                ? Math.min(...convergenceData.map((d) => d.difference)) < 5 
                  ? "🎯 Excelente precisión" 
                  : "📈 Mejorando precisión"
                : "Esperando datos..."}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Éxito Más Frecuente:</span>
            <p className="font-semibold text-lg">
              {distributionData.length > 0
                ? `${distributionData.reduce((max, curr) => (curr.frequency > max.frequency ? curr : max)).successes} éxitos`
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {distributionData.length > 0 
                ? `${distributionData.reduce((max, curr) => (curr.frequency > max.frequency ? curr : max)).frequency} veces`
                : "Esperando datos..."}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Variabilidad:</span>
            <p className="font-semibold text-lg">
              {temporalData.length > 0 ? calculateVariability(temporalData.map((d) => d.successes)).toFixed(3) : "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {temporalData.length > 0 
                ? calculateVariability(temporalData.map((d) => d.successes)) < 0.5 
                  ? "🎯 Muy consistente" 
                  : calculateVariability(temporalData.map((d) => d.successes)) < 1 
                    ? "📊 Moderadamente consistente" 
                    : "📈 Alta variabilidad"
                : "Esperando datos..."}
            </p>
          </div>
        </div>

        {/* Evaluación general del experimento */}
        {experimentData.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h5 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">📝 Evaluación General del Experimento</h5>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">
              {(() => {
                const maxDiff = Math.max(...convergenceData.map((d) => d.difference))
                const minDiff = Math.min(...convergenceData.map((d) => d.difference))
                const avgDiff = convergenceData.reduce((sum, d) => sum + d.difference, 0) / convergenceData.length
                
                let quality = "excelente"
                let icon = "🏆"
                if (avgDiff > 15) {
                  quality = "necesita más datos"
                  icon = "📈"
                } else if (avgDiff > 10) {
                  quality = "buena"
                  icon = "👍"
                } else if (avgDiff > 5) {
                  quality = "muy buena"
                  icon = "⭐"
                }
                
                return (
                  <p>
                    {icon} La calidad de tu experimento es <strong>{quality}</strong>. 
                    Diferencia promedio: <strong>{avgDiff.toFixed(2)}%</strong>. 
                    {avgDiff > 10 
                      ? " Considera aumentar el número de experimentos para mejorar la convergencia."
                      : " Tus resultados muestran una buena convergencia hacia la teoría."}
                  </p>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Sección educativa adicional */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">🎓 Conceptos Teóricos Fundamentales</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">📚 Distribución Binomial</h5>
            <p className="text-purple-600 dark:text-purple-400 mb-2">
              Una distribución binomial modela el número de éxitos en n ensayos independientes, cada uno con probabilidad p de éxito.
            </p>
            <ul className="text-xs space-y-1 text-purple-500 dark:text-purple-400">
              <li>• <strong>n:</strong> Número total de ensayos ({config.numDice} dados)</li>
              <li>• <strong>p:</strong> Probabilidad de éxito ({(theoreticalProbability * 100).toFixed(1)}%)</li>
              <li>• <strong>k:</strong> Número de éxitos obtenidos</li>
              <li>• <strong>Media:</strong> μ = n × p</li>
              <li>• <strong>Varianza:</strong> σ² = n × p × (1-p)</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">⚖️ Ley de los Grandes Números</h5>
            <p className="text-purple-600 dark:text-purple-400 mb-2">
              Cuando el número de experimentos aumenta, la probabilidad observada se acerca a la probabilidad teórica.
            </p>
            <ul className="text-xs space-y-1 text-purple-500 dark:text-purple-400">
              <li>• Con pocos experimentos: alta variabilidad</li>
              <li>• Con muchos experimentos: convergencia a la teoría</li>
              <li>• No garantiza resultados exactos en pequeñas muestras</li>
              <li>• Fundamental para validar modelos estadísticos</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">🎯 Interpretación de Resultados</h5>
            <p className="text-purple-600 dark:text-purple-400 mb-2">
              Cómo evaluar si tus experimentos son representativos de la teoría estadística.
            </p>
            <ul className="text-xs space-y-1 text-purple-500 dark:text-purple-400">
              <li>• <strong>Convergencia:</strong> Las líneas se acercan con más datos</li>
              <li>• <strong>Variabilidad:</strong> Normal al inicio, disminuye con tiempo</li>
              <li>• <strong>Sesgo:</strong> Diferencias sistemáticas pueden indicar problemas</li>
              <li>• <strong>Intervalos de confianza:</strong> Rango esperado de resultados</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">🔬 Aplicaciones Prácticas</h5>
            <p className="text-purple-600 dark:text-purple-400 mb-2">
              Situaciones del mundo real donde se aplican estos conceptos estadísticos.
            </p>
            <ul className="text-xs space-y-1 text-purple-500 dark:text-purple-400">
              <li>• <strong>Control de calidad:</strong> Defectos en producción</li>
              <li>• <strong>Medicina:</strong> Efectividad de tratamientos</li>
              <li>• <strong>Finanzas:</strong> Modelado de riesgos</li>
              <li>• <strong>Investigación:</strong> Validación de hipótesis</li>
            </ul>
          </div>
        </div>

        {/* Consejos para mejorar el experimento */}
        <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
          <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">💡 Consejos para Mejorar tu Experimento</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-purple-700 dark:text-purple-300">
                <strong>Más Datos:</strong> Aumenta el número de experimentos para mejor convergencia
              </p>
            </div>
            <div>
              <p className="text-purple-700 dark:text-purple-300">
                <strong>Diferentes Configuraciones:</strong> Prueba distintos criterios de éxito
              </p>
            </div>
            <div>
              <p className="text-purple-700 dark:text-purple-300">
                <strong>Documenta Patrones:</strong> Observa tendencias en los gráficos
              </p>
            </div>
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
