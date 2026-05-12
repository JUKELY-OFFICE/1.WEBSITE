'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useScheduler } from "@/lib/tv/useScheduler"
import { useMenuData } from "@/lib/tv/useMenuData"
import ClosedScreen from "@/components/tv/ClosedScreen"
import BreakfastScreenChalk from "@/components/tv/BreakfastScreenChalk"
import LunchScreen from "@/components/tv/LunchScreen"
import HappyHourScreen from "@/components/tv/HappyHourScreen"

const VALID_MODES = ["breakfast", "lunch", "lunch_weekend", "happy_hour", "apero", "closed"]

export default function TVDisplay() {
  const searchParams = useSearchParams()
  const scheduled = useScheduler()
  const menu = useMenuData()
  const previewParam = searchParams.get("preview")
  const mode = (previewParam && VALID_MODES.includes(previewParam))
    ? previewParam
    : scheduled

  useEffect(() => {
    const style = document.createElement("style")
    style.id = "hide-cursor"
    style.textContent = "*, *::before, *::after { cursor: none !important; }"

    let timer = /** @type {ReturnType<typeof setTimeout>|undefined} */ (undefined)

    const hide = () => {
      if (!document.getElementById("hide-cursor")) document.head.appendChild(style)
    }
    const show = () => {
      document.getElementById("hide-cursor")?.remove()
      clearTimeout(timer)
      timer = setTimeout(hide, 2000)
    }

    document.addEventListener("mousemove", show)
    timer = setTimeout(hide, 2000)

    return () => {
      document.removeEventListener("mousemove", show)
      clearTimeout(timer)
      document.getElementById("hide-cursor")?.remove()
    }
  }, [])

  if (menu.loading) return null

  const renderScreen = () => {
    switch (mode) {
      case "breakfast":  return <BreakfastScreenChalk formules={menu.breakfastFormulas} aCarte={menu.breakfastACarte} oeufs={menu.breakfastOeufs} />
      case "lunch":         return <LunchScreen entree={menu.lunchEntree} plat={menu.lunchPlat} dessert={menu.lunchDessert} vins={menu.lunchVins} />
      case "lunch_weekend": return <LunchScreen entree={menu.lwEntree} plat={menu.lwPlat} dessert={menu.lwDessert} vins={menu.lwVins} showDice={false} photos={menu.lwPhotos} />
      case "happy_hour": return <HappyHourScreen cocktails={menu.hhCocktails} bieres={menu.hhBieres} vins={menu.hhVins} tapasSignature={menu.hhTapasSignature} spiritueux={menu.hhSpiritueux} messageBas={menu.hhMessageBas} />
      case "apero":      return <HappyHourScreen cocktails={menu.aperoCocktails} bieres={menu.aperoBieres} vins={menu.aperoVins} tapasSignature={menu.aperoTapasSignature} spiritueux={menu.aperoSpiritueux} messageBas={menu.aperoMessageBas} titre="Apéro" wineOnly photos={menu.aperoPhotos} />
      case "closed":
      default:           return <ClosedScreen />
    }
  }

  return (
    <main
      key={mode}
      className="screen-enter"
      style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "fixed", inset: 0 }}>
      {renderScreen()}
    </main>
  )
}