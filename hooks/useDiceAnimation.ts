"use client"

import { useState, useCallback } from "react"

interface AnimationState {
  isRolling: boolean
  rotationSpeed: number
  bounceHeight: number
}

export function useDiceAnimation() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isRolling: false,
    rotationSpeed: 0,
    bounceHeight: 0,
  })

  const startRoll = useCallback(() => {
    setAnimationState({
      isRolling: true,
      rotationSpeed: 0.1 + Math.random() * 0.1,
      bounceHeight: 0.5 + Math.random() * 0.3,
    })
  }, [])

  const stopRoll = useCallback(() => {
    setAnimationState({
      isRolling: false,
      rotationSpeed: 0,
      bounceHeight: 0,
    })
  }, [])

  return {
    animationState,
    startRoll,
    stopRoll,
  }
}
