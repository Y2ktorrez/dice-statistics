"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Text, Box } from "@react-three/drei"
import { useDiceAnimation } from "@/hooks/useDiceAnimation"
import type * as THREE from "three"

interface DiceProps {
  position: [number, number, number]
  onResult: (value: number) => void
  isRolling: boolean
  diceIndex: number
}

function Dice({ position, onResult, isRolling, diceIndex }: DiceProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentValue, setCurrentValue] = useState(1)
  const { animationState, startRoll } = useDiceAnimation()

  useFrame((state) => {
    if (meshRef.current && isRolling) {
      meshRef.current.rotation.x += 0.1
      meshRef.current.rotation.y += 0.15
      meshRef.current.rotation.z += 0.05

      // Simular rebote
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.2
    }
  })

  useEffect(() => {
    if (isRolling) {
      const rollDuration = 2000 + Math.random() * 1000 // 2-3 segundos

      setTimeout(() => {
        const result = Math.floor(Math.random() * 6) + 1
        setCurrentValue(result)
        onResult(result)

        // Resetear posición
        if (meshRef.current) {
          meshRef.current.position.y = position[1]
          meshRef.current.rotation.set(0, 0, 0)
        }
      }, rollDuration)
    }
  }, [isRolling, onResult, position])

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 1, 1]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" />
      </Box>

      {/* Números en las caras del dado */}
      <Text position={[0, 0, 0.51]} fontSize={0.3} color="black" anchorX="center" anchorY="middle">
        {currentValue}
      </Text>
    </group>
  )
}

interface DiceSimulator3DProps {
  config: {
    numDice: number
    successCriteria: number[]
    numTrials: number
    isRunning: boolean
  }
  onResult: (results: number[]) => void
  currentTrial: number
  isRolling: boolean
  rollDice: () => void
}

export default function DiceSimulator3D({ config, onResult, currentTrial, isRolling, rollDice }: DiceSimulator3DProps) {
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [completedDice, setCompletedDice] = useState(0)

  const handleDiceResult = (value: number, index: number) => {
    setDiceResults((prev) => {
      const newResults = [...prev]
      newResults[index] = value
      return newResults
    })

    setCompletedDice((prev) => prev + 1)
  }

  useEffect(() => {
    if (completedDice === config.numDice && completedDice > 0) {
      onResult(diceResults)
      setCompletedDice(0)
      setDiceResults([])
      // setIsRolling eliminado, ahora se maneja en el componente principal
    }
  }, [completedDice, config.numDice, diceResults, onResult])

  // rollDice ahora viene por props

  // Posiciones de los dados en 3D
  const getDicePositions = (numDice: number): [number, number, number][] => {
    const positions: [number, number, number][] = []
    const spacing = 2.5
    const startX = (-(numDice - 1) * spacing) / 2

    for (let i = 0; i < numDice; i++) {
      positions.push([startX + i * spacing, 2, 0])
    }
    return positions
  }

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg overflow-hidden">
      <Canvas shadows camera={{ position: [0, 5, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Mesa/Superficie */}
        <Box args={[15, 0.2, 8]} position={[0, -1, 0]} receiveShadow>
          <meshStandardMaterial color="#8B4513" />
        </Box>

        {/* Dados */}
        {getDicePositions(config.numDice).map((position, index) => (
          <Dice
            key={index}
            position={position}
            onResult={(value) => handleDiceResult(value, index)}
            isRolling={isRolling}
            diceIndex={index}
          />
        ))}

        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI / 2} />
        <Environment preset="studio" />
      </Canvas>

      {/* El botón de lanzar dados se moverá al ControlPanel */}
    </div>
  )
}
