import { useState, useEffect } from "react"
import MenuFrame from "./MenuFrame"
import type { Photo } from "@/lib/tv/useMenuData"

const CHALK      = "#F2EDE4"
const CHALK_LINE = "rgba(242,237,228,0.22)"
const FONT       = "var(--font-chalk), cursive"

interface Props {
  photos: Photo[]
}

export default function LunchPhotoScreen({ photos }: Props) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [visible, setVisible]   = useState(true)

  const totalSlides = Math.max(1, Math.ceil(photos.length / 3))

  useEffect(() => {
    if (photos.length <= 3) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % totalSlides)
        setVisible(true)
      }, 600)
    }, 15_000)
    return () => clearInterval(timer)
  }, [photos.length, totalSlides])

  const group = photos.slice(slideIdx * 3, slideIdx * 3 + 3)
  const [p1, p2, p3] = group

  return (
    <MenuFrame theme="slate">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Bannière — identique à LunchScreen */}
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Almond Butter', cursive",
              fontSize: "3.8vw", color: CHALK,
              lineHeight: 1.2, marginBottom: "0.3vh", letterSpacing: "-0.04em",
            }}>
              Déjeuner
            </h1>
            <p style={{
              fontFamily: FONT, fontSize: "1.2vw", letterSpacing: "0.2em",
              color: CHALK, opacity: 0.45,
            }}>
              — de 11h30 à 15h —
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height: "1px", background: CHALK_LINE, margin: "1vh 0" }} />

        {/* Grille photos */}
        <div style={{
          flex: 1, minHeight: 0,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease",
          display: "grid",
          gridTemplateColumns: p2 ? "2fr 1fr" : "1fr",
          gap: "1.5%",
        }}>
          {p1 && (
            <div style={{ borderRadius: "8px", overflow: "hidden", minHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p1.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          )}
          {p2 && (
            <div style={{ display: "grid", gridTemplateRows: p3 ? "1fr 1fr" : "1fr", gap: "1.5%", minHeight: 0 }}>
              <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p2.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              {p3 && (
                <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p3.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </MenuFrame>
  )
}
