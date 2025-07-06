"use client"

import { useState } from "react"
import DiceSimulator3D from "@/components/DiceSimulator3D"
import ControlPanel from "@/components/ControlPanel"
import StatisticsPanel from "@/components/StatisticsPanel"
import ChartsDisplay from "@/components/ChartsDisplay"
import { useExperimentData } from "@/hooks/useExperimentData"
import { useBinomialCalculation } from "@/hooks/useBinomialCalculation"

export default function DiceResearchApp() {
  const [experimentConfig, setExperimentConfig] = useState({
    numDice: 2,
    successCriteria: [6], // números que se consideran éxito
    numTrials: 100,
    isRunning: false,
  })

  const [darkMode, setDarkMode] = useState(false)

  const { experimentData, currentTrial, addResult, resetExperiment, exportData } = useExperimentData()

  const { theoreticalProbability, observedProbability, binomialStats, confidenceInterval } = useBinomialCalculation(
    experimentData,
    experimentConfig,
  )

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                Investigación Estadística de Dados
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Análisis de Distribución Binomial con Simulación 3D
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 3D Simulator */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Simulador 3D de Dados</h2>
              <DiceSimulator3D config={experimentConfig} onResult={addResult} currentTrial={currentTrial} />
            </div>

            {/* Charts Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Análisis Gráfico</h2>
              <ChartsDisplay
                experimentData={experimentData}
                theoreticalProbability={theoreticalProbability}
                config={experimentConfig}
              />
            </div>
          </div>

          {/* Right Column - Controls and Statistics */}
          <div className="space-y-8">
            {/* Control Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Panel de Control</h2>
              <ControlPanel
                config={experimentConfig}
                onConfigChange={setExperimentConfig}
                onReset={resetExperiment}
                onExport={exportData}
                currentTrial={currentTrial}
              />
            </div>

            {/* Statistics Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Análisis Estadístico</h2>
              <StatisticsPanel
                theoreticalProbability={theoreticalProbability}
                observedProbability={observedProbability}
                binomialStats={binomialStats}
                confidenceInterval={confidenceInterval}
                experimentData={experimentData}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">Instrucciones de Uso</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">1. Configuración del Experimento</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Selecciona el número de dados (1-6)</li>
                <li>Define los criterios de éxito</li>
                <li>Establece el número de intentos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Análisis de Resultados</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Observa las probabilidades teóricas vs experimentales</li>
                <li>Analiza los gráficos de distribución</li>
                <li>Exporta los datos para análisis adicional</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
