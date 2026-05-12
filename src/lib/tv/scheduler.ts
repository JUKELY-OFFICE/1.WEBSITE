import type { ScreenMode } from "@/types/tv"
import { tvTheme } from "@/theme/tv"

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function nowInMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function getCurrentMode(): ScreenMode {
  const now     = nowInMinutes()
  const day     = new Date().getDay() // 0=dim, 6=sam
  const weekend = day === 0 || day === 6
  const { breakfast, lunch, happyHour } = tvTheme.schedule

  if (now >= timeToMinutes(breakfast.start) && now < timeToMinutes(breakfast.end)) return "breakfast"
  if (now >= timeToMinutes(lunch.start)     && now < timeToMinutes(lunch.end))     return "lunch"
  if (now >= timeToMinutes(happyHour.start) && now < timeToMinutes(happyHour.end)) return weekend ? "apero" : "happy_hour"
  return "closed"
}
