"use client"

import { useState, useEffect } from "react"

interface ControlPanelProps {
  config: {
    numDice: number
    successCriteria: number[]
    numTrials: number
    isRunning: boolean
  }
  onConfigChange: (config: any) => void
  onReset: () => void
  onExport: () => void
  currentTrial: number
  isRolling: boolean
  rollDice: () => void
}

export default function ControlPanel({ config, onConfigChange, onReset, onExport, currentTrial, isRolling, rollDice }: ControlPanelProps) {
  const [tempCriteria, setTempCriteria] = useState(config.successCriteria.join(","))
  const [criteriaError, setCriteriaError] = useState("")

  const updateConfig = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value,
    })
  }

  const validateCriteria = (input: string) => {
    const values = input.split(",").map(n => n.trim()).filter(n => n !== "")
    const invalidValues = []
    const validNumbers = []
    
    for (const value of values) {
      const num = Number.parseInt(value)
      if (isNaN(num) || num < 1 || num > 6) {
        invalidValues.push(value)
      } else {
        validNumbers.push(num)
      }
    }
    
    if (invalidValues.length > 0) {
      setCriteriaError(`Valores inválidos: ${invalidValues.join(", ")}. Solo se permiten números del 1 al 6.`)
      return false
    } else if (validNumbers.length === 0) {
      setCriteriaError("Debe ingresar al menos un criterio de éxito válido.")
      return false
    } else {
      setCriteriaError("")
      return true
    }
  }

  const updateSuccessCriteria = () => {
    if (validateCriteria(tempCriteria)) {
      const criteria = tempCriteria
        .split(",")
        .map((n) => Number.parseInt(n.trim()))
        .filter((n) => n >= 1 && n <= 6)
        .filter((n, index, arr) => arr.indexOf(n) === index) // Remover duplicados

      updateConfig("successCriteria", criteria)
    }
  }

  // Validar en tiempo real mientras se escribe
  useEffect(() => {
    if (tempCriteria.trim() !== "") {
      validateCriteria(tempCriteria)
    } else {
      setCriteriaError("")
    }
  }, [tempCriteria])

  const presetConfigurations = [
    { name: "Básico (1 dado, 6)", numDice: 1, successCriteria: [6], numTrials: 50 },
    { name: "Doble (2 dados, 6)", numDice: 2, successCriteria: [6], numTrials: 100 },
    { name: "Números altos (2 dados, 5-6)", numDice: 2, successCriteria: [5, 6], numTrials: 100 },
    { name: "Números bajos (2 dados, 1-2)", numDice: 2, successCriteria: [1, 2], numTrials: 100 },
  ]

  return (
    <div className="space-y-6">
      {/* Configuración básica */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Número de Dados: {config.numDice}</label>
          <input
            type="range"
            min="1"
            max="2"
            value={config.numDice}
            onChange={(e) => updateConfig("numDice", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo: 2 dados</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Criterios de Éxito (números separados por coma)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempCriteria}
              onChange={(e) => setTempCriteria(e.target.value)}
              placeholder="ej: 5,6"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 ${
                criteriaError 
                  ? "border-red-500 focus:ring-red-500 dark:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
              }`}
            />
            <button
              onClick={updateSuccessCriteria}
              disabled={criteriaError !== ""}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>
          {criteriaError && (
            <p className="text-xs text-red-500 mt-1 font-medium">{criteriaError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Actual: {config.successCriteria.join(", ")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Número de Intentos: {config.numTrials}</label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={config.numTrials}
            onChange={(e) => updateConfig("numTrials", Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        {/* Botón Lanzar Dados debajo de Número de Intentos */}
        <div className="flex justify-center mt-4">
          <button
            onClick={rollDice}
            disabled={isRolling || currentTrial >= config.numTrials}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            {isRolling ? "Lanzando..." : `Lanzar Dados (${currentTrial}/${config.numTrials})`}
          </button>
        </div>
      </div>
      {/* Progreso del experimento */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progreso del Experimento</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentTrial}/{config.numTrials}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentTrial / config.numTrials) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Controles de acción */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reiniciar
        </button>
        <button
          onClick={onExport}
          disabled={currentTrial === 0}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          Exportar Datos
        </button>
      </div>
    </div>
  )
}
