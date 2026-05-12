// ============================================================
//  ÉCRAN HAPPY HOUR — 3 colonnes : menu | photos | coups de cœur
// ============================================================

import { useState, useEffect } from "react"
import MenuFrame from "./MenuFrame"
import type { DisplayItem } from "@/types/tv"
import type { Photo } from "@/lib/tv/useMenuData"

interface Props {
  cocktails:       DisplayItem[]
  bieres:          DisplayItem[]
  vins:            DisplayItem[]
  tapasSignature:  DisplayItem[]
  spiritueux:      DisplayItem[]
  messageBas:      DisplayItem | null
  titre?:          string
  wineOnly?:       boolean
  photos?:         Photo[]
}

function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (photos.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(i => (i + 1) % photos.length); setVisible(true) }, 600)
    }, 60_000)
    return () => clearInterval(timer)
  }, [photos.length])

  if (photos.length === 0) return null

  return (
    <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", position: "relative", minHeight: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[idx].url} alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover",
          opacity: visible ? 1 : 0, transition: "opacity 0.6s ease",
          position: "absolute", inset: 0 }} />
    </div>
  )
}

const CHALK      = "#F2EDE4"
const CHALK_DIM  = "rgba(242,237,228,0.6)"

const CHALK_LINE = "rgba(242,237,228,0.22)"
const PRICE      = "#E8C07A"
const FONT       = "var(--font-chalk), cursive"
const CURSIVE    = "'Almond Butter', cursive"

// ── Section header + liste ────────────────────────────────────
function MenuSection({ title, subtitle, items, nameSz, priceSz, padV }: {
  title: string; subtitle?: string; items: DisplayItem[]
  nameSz: number; priceSz: number; padV: number
}) {
  if (!items.length) return null
  return (
    <div style={{ marginBottom: "1.2vh" }}>
      <h2 style={{
        fontFamily: FONT, fontSize: "1.1vw", fontWeight: 600,
        letterSpacing: "0.18em", color: CHALK_DIM, textTransform: "uppercase",
        paddingBottom: "0.5vh", borderBottom: `1px solid ${CHALK_LINE}`, marginBottom: "0.4vh",
      }}>
        {title}
        {subtitle && <span style={{ fontSize: "0.82vw", fontWeight: 400, marginLeft: "0.5vw", opacity: 0.7 }}>{subtitle}</span>}
      </h2>
      {items.map((item) => (
        <div key={item.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          padding: `${padV}vh 0`,
        }}>
          <span style={{ fontFamily: FONT, fontSize: `${nameSz}vw`, color: CHALK }}>
            {item.name}
            {item.description && (
              <span style={{ fontSize: `${nameSz * 0.78}vw`, color: CHALK_DIM, fontStyle: "italic", marginLeft: "0.4vw" }}>
                {item.description}
              </span>
            )}
          </span>
          <span style={{ fontFamily: FONT, fontSize: `${priceSz}vw`, fontWeight: 700, color: PRICE, whiteSpace: "nowrap", marginLeft: "0.8vw" }}>
            {item.prix.toFixed(1)} €
          </span>
        </div>
      ))}
    </div>
  )
}


// ── Box section droite ───────────────────────────────────────
function SideBox({ title, subtitle, items }: { title: string; subtitle?: string; items: DisplayItem[] }) {
  const n = items.length
  const nameSz  = n <= 4 ? 1.75 : n <= 7 ? 1.45 : n <= 10 ? 1.45 : 1.25
  const priceSz = n <= 4 ? 1.8  : n <= 7 ? 1.5  : n <= 10 ? 1.5  : 1.3
  const padV    = n <= 4 ? 0.55 : n <= 7 ? 0.38 : 0.22

  return (
    <div style={{
      flex: "0 0 auto",
      border: `1px solid rgba(232,192,122,0.28)`,
      borderRadius: "8px",
      padding: "1.1vw 1.3vw",
      background: "rgba(0,0,0,0.22)",
      display: "flex",
      flexDirection: "column",
    }}>
      <h2 style={{
        fontFamily: FONT, fontSize: "1.1vw", fontWeight: 600,
        letterSpacing: "0.18em", color: PRICE, textTransform: "uppercase",
        paddingBottom: "0.5vh", borderBottom: `1px solid ${CHALK_LINE}`, marginBottom: "0.5vh",
        display: "flex", alignItems: "baseline", gap: "0.5vw",
        opacity: 0.85,
      }}>
        {title}
        {subtitle && <span style={{ fontSize: "0.82vw", fontWeight: 400, opacity: 0.7, letterSpacing: "0.1em" }}>{subtitle}</span>}
      </h2>
      {items.length === 0 ? (
        <span style={{ fontFamily: FONT, fontSize: "0.85vw", color: CHALK_DIM, fontStyle: "italic", opacity: 0.5, marginTop: "0.5vh" }}>
          À venir…
        </span>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              padding: `${padV}vh 0`,
            }}>
              <span style={{ fontFamily: FONT, fontSize: `${nameSz}vw`, color: CHALK }}>
                {item.name}
                {item.description && (
                  <span style={{ fontSize: `${nameSz * 0.78}vw`, color: CHALK_DIM, fontStyle: "italic", marginLeft: "0.4vw" }}>
                    {item.description}
                  </span>
                )}
              </span>
              <span style={{ fontFamily: FONT, fontSize: `${priceSz}vw`, fontWeight: 700, color: PRICE, whiteSpace: "nowrap", marginLeft: "0.8vw" }}>
                {item.prix.toFixed(1)} €
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Écran principal ───────────────────────────────────────────
export default function HappyHourScreen({ cocktails, bieres, vins, tapasSignature, spiritueux, messageBas, titre = "Happy Hour", wineOnly = false, photos = [] }: Props) {
  const totalItems = cocktails.length + bieres.length + vins.length
  const nameSz  = totalItems <= 10 ? 1.65 : totalItems <= 14 ? 1.4  : 1.15
  const priceSz = totalItems <= 10 ? 1.7  : totalItems <= 14 ? 1.45 : 1.2
  const padV    = totalItems <= 10 ? 0.55 : totalItems <= 14 ? 0.38 : 0.25

  if (wineOnly) {
    return (
      <MenuFrame theme="slate" showLogo={false}>
        <div style={{ display: "flex", gap: "3vw", height: "100%", overflow: "hidden" }}>

          {/* Colonne gauche : vins + spiritueux */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh" }}>
            <div>
              <h1 style={{ fontFamily: CURSIVE, fontSize: "3.8vw", color: CHALK, lineHeight: 1.2, margin: 0, letterSpacing: "-0.04em" }}>
                Apéro
              </h1>
              <p style={{ fontFamily: FONT, fontSize: "1.2vw", letterSpacing: "0.2em", color: CHALK, opacity: 0.45, margin: 0 }}>
                — de 16h à 23h —
              </p>
            </div>
            <SideBox title="Nos vins du moment" items={tapasSignature} />
            <SideBox title="Spiritueux" subtitle="6 cl" items={spiritueux} />
            {messageBas && (
              <p style={{ fontFamily: FONT, fontSize: "1.1vw", fontWeight: 600,
                letterSpacing: "0.18em", color: CHALK_DIM, textTransform: "uppercase", textAlign: "center" }}>
                {messageBas.name}
              </p>
            )}
          </div>

          {/* Colonne droite : carousel photos */}
          {photos.length > 0 && <>
            <div style={{ width: "1px", background: "rgba(242,237,228,0.22)", alignSelf: "stretch" }} />
            <div style={{ width: "30%", display: "flex", flexDirection: "column" }}>
              <PhotoCarousel photos={photos} />
            </div>
          </>}

        </div>
      </MenuFrame>
    )
  }

  return (
    <MenuFrame theme="slate" showLogo={false}>
      <div style={{ display: "flex", gap: "2vw", height: "100%", overflow: "hidden" }}>

        {/* ── COLONNE GAUCHE : menu ── */}
        <div style={{ display: "flex", flexDirection: "column", width: "50%", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1.2vw", marginBottom: "0.5vh" }}>
            <h1 style={{
              fontFamily: CURSIVE, fontSize: "3.5vw", color: CHALK,
              lineHeight: 1.15, paddingTop: 0, margin: 0, letterSpacing: "-0.03em",
            }}>
              {titre}
            </h1>
            <span style={{
              fontFamily: FONT, fontSize: "1.05vw", letterSpacing: "0.15em",
              color: CHALK, opacity: 0.45,
            }}>
              de 16h à 23h du lundi au samedi
            </span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.5vh", overflow: "hidden" }}>
            <MenuSection title="Cocktails" subtitle="25 cl" items={cocktails} nameSz={nameSz} priceSz={priceSz} padV={padV} />
            <MenuSection title="Bières"    subtitle="50 cl" items={bieres}    nameSz={nameSz} priceSz={priceSz} padV={padV} />
            <MenuSection title="Vins"      subtitle="25 cl" items={vins}      nameSz={nameSz} priceSz={priceSz} padV={padV} />
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ width: "1px", background: CHALK_LINE, alignSelf: "stretch" }} />

        {/* ── COLONNE DROITE : boxes ── */}
        <div className="flex flex-col" style={{ width: "50%", gap: "1.5vh" }}>
          <div style={{ textAlign: "center", paddingTop: "0.2vh", paddingBottom: "0.4vh" }}>
            <p style={{
              fontFamily: FONT, fontSize: "1.05vw", letterSpacing: "0.22em",
              color: PRICE, textTransform: "uppercase", opacity: 0.9,
            }}>
              ✦ Nos coups de cœur ✦
            </p>
          </div>
          <SideBox title="Nos vins du moment" items={tapasSignature} />
          <SideBox title="Spiritueux" subtitle="6 cl" items={spiritueux} />
          {messageBas && (
            <p style={{
              fontFamily: FONT, fontSize: "1.1vw", fontWeight: 600,
              letterSpacing: "0.18em", color: CHALK_DIM, textTransform: "uppercase",
              paddingTop: "0.5vh", textAlign: "center",
            }}>
              {messageBas.name}
            </p>
          )}
        </div>
      </div>
    </MenuFrame>
  )
}
