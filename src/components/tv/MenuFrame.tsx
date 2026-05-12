// ============================================================
//  CADRE MENU — Style brasserie parisienne
// ============================================================

import { useState, useEffect } from "react"

const ORANGE = "#C8551A"
const ORANGE_LIGHT = "rgba(200,85,26,0.25)"

const THEMES = {
  cream: {
    bg: "#F5EBD8",
    border: ORANGE,
    borderLight: ORANGE_LIGHT,
    dateColor: "#1B3A2E",
    timeColor: ORANGE,
    timeBg: "rgba(200,85,26,0.08)",
    timeBorder: ORANGE_LIGHT,
    logoFilter: "none",
  },
  slate: {
    bg: "#1A1D20",
    border: "rgba(242,237,228,0.55)",
    borderLight: "rgba(242,237,228,0.18)",
    dateColor: "#F2EDE4",
    timeColor: "#F2EDE4",
    timeBg: "rgba(242,237,228,0.08)",
    timeBorder: "rgba(242,237,228,0.2)",
    logoFilter: "brightness(0) invert(1)",
  },
}


interface MenuFrameProps {
  children: React.ReactNode
  theme?: "cream" | "slate"
  showLogo?: boolean
}

export default function MenuFrame({ children, theme = "cream", showLogo = true }: MenuFrameProps) {
  const [datetime, setDatetime] = useState({ date: "", time: "" })
  const t = THEMES[theme]

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setDatetime({
        date: now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
        time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: t.bg, padding: "1.8vw" }}>


      {/* Barre date/heure */}
      <div className="absolute z-10 flex items-center justify-end"
        style={{ top: "1.8vw", left: "2.8vw", right: "2.8vw", paddingTop: "0.3vh", paddingBottom: "0.3vh" }}>
        <div className="flex items-center gap-4">
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9vw", color: t.dateColor, opacity: 0.55, textTransform: "capitalize" }}>
            {datetime.date}
          </p>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "1.5vw", fontWeight: 700, color: t.timeColor, background: t.timeBg, border: `1px solid ${t.timeBorder}`, borderRadius: "999px", padding: "0.3vh 1.2vw", letterSpacing: "0.05em" }}>
            {datetime.time}
          </div>
        </div>
      </div>

      {/* Contenu — positionné absolument sous la barre */}
      <div className="absolute z-10 overflow-hidden"
        style={{ top: "3.8vw", left: "2.8vw", right: "2.8vw", bottom: "2.2vw" }}>
        {children}
      </div>

      {/* Logo coin bas-droit */}
      {showLogo && (
        <div style={{ position: "absolute", bottom: "3.5vw", right: "3.5vw", width: "8vw", height: "8vw", borderRadius: "50%", overflow: "hidden", zIndex: 35 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/tv/logo.png" alt="The Saint Placide" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

    </div>
  )
}
