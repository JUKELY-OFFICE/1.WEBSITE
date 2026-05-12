import { useState, useEffect } from "react"
import type { ScreenMode } from "@/types/tv"
import { getCurrentMode } from "./scheduler"

export function useScheduler() {
  const [mode, setMode] = useState<ScreenMode>(getCurrentMode)

  useEffect(() => {
    const check = () => {
      const next = getCurrentMode()
      setMode(prev => prev !== next ? next : prev)
    }
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  return mode
}
