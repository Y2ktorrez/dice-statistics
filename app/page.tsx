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
  const [isRolling, setIsRolling] = useState(false)
  const [calculatorResult, setCalculatorResult] = useState<{
    k: number
    probability: number
    percentage: string
    binomialCoefficient: number
  } | null>(null)

  const { experimentData, currentTrial, addResult, resetExperiment, exportData } = useExperimentData(experimentConfig)

  const { 
    binomialDistribution, 
    theoreticalProbabilityForK, 
    observedProbability, 
    binomialStats, 
    confidenceInterval,
    parameters 
  } = useBinomialCalculation(experimentData, experimentConfig)

  const rollDice = () => {
    if (!isRolling && currentTrial < experimentConfig.numTrials) {
      setIsRolling(true)
      // El resultado de los dados se maneja en DiceSimulator3D y se notifica por onResult
    }
  }

  // Cuando termina una tirada, DiceSimulator3D debe llamar a setIsRolling(false)
  const handleResult = (results: number[]) => {
    addResult(results)
    setIsRolling(false)
  }

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
              <DiceSimulator3D
                config={experimentConfig}
                onResult={handleResult}
                currentTrial={currentTrial}
                isRolling={isRolling}
                rollDice={rollDice}
              />
            </div>

            {/* Charts Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Análisis Gráfico</h2>
              <ChartsDisplay
                experimentData={experimentData}
                theoreticalProbability={parameters.p}
                config={experimentConfig}
              />
            </div>

            {/* Statistics Panel moved below charts */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Análisis Estadístico</h2>
              <StatisticsPanel
                binomialDistribution={binomialDistribution}
                theoreticalProbabilityForK={theoreticalProbabilityForK}
                observedProbability={observedProbability}
                binomialStats={binomialStats}
                confidenceInterval={confidenceInterval}
                parameters={parameters}
                experimentData={experimentData}
                experimentConfig={experimentConfig}
              />
            </div>
          </div>

          {/* Right Column - Only Control Panel */}
          <div className="space-y-8">
            {/* Control Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Panel de Control</h2>
              <ControlPanel
                config={experimentConfig}
                onConfigChange={setExperimentConfig}
                onReset={resetExperiment}
                onExport={() =>
                  exportData({
                    binomialDistribution,
                    theoreticalProbabilityForK,
                    observedProbability,
                    binomialStats,
                    confidenceInterval,
                    parameters,
                    calculatorResult,
                  })
                }
                currentTrial={currentTrial}
                isRolling={isRolling}
                rollDice={rollDice}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
