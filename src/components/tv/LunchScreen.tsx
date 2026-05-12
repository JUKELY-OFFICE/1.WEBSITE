// ============================================================
//  ÉCRAN DÉJEUNER — VERSION ARDOISE FULL CRAIE
//  Même mise en page que le petit-déjeuner
// ============================================================

import { useState, useEffect } from "react"
import MenuFrame from "./MenuFrame"
import type { DisplayItem } from "@/types/tv"
import type { Photo } from "@/lib/tv/useMenuData"

interface Props {
  entree:    DisplayItem | null
  plat:      DisplayItem | null
  dessert:   DisplayItem | null
  vins:      DisplayItem[]
  showDice?: boolean
  photos?:   Photo[]
}

const CHALK       = "#F2EDE4"
const CHALK_DIM   = "rgba(242,237,228,0.6)"
const CHALK_LINE  = "rgba(242,237,228,0.22)"
const PRICE       = "#E8C07A"
const AMBER       = "#E8A84A"
const SP_ORANGE   = "#C8551A"
const FONT        = "var(--font-chalk), cursive"

// ── Tasse SVG ─────────────────────────────────────────────────
function CupSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M13 9 Q11 6 13 3" stroke={CHALK} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M20 9 Q18 5 20 2" stroke={CHALK} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M27 9 Q25 6 27 3" stroke={CHALK} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M8 12 L9 28 Q9 30 11 30 L29 30 Q31 30 31 28 L32 12 Z" fill={CHALK} opacity="0.95"/>
      <path d="M31 16 Q38 16 38 22 Q38 28 31 28" stroke={CHALK} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9"/>
      <ellipse cx="20" cy="33" rx="14" ry="3.5" fill={CHALK} opacity="0.85"/>
      <ellipse cx="20" cy="33" rx="10" ry="2" fill={CHALK} opacity="0.3"/>
    </svg>
  )
}

// ── Dé brandé Saint-Placide ──────────────────────────────────
function SPDie({ size = 56, showCup = true }: { size?: number; showCup?: boolean }) {
  const face   = Math.round(size * 0.72)
  const radius = Math.round(size * 0.18)
  const faceR  = Math.round(size * 0.1)
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: radius,
      background: "linear-gradient(145deg, #FDF6E8 0%, #ECD9B4 55%, #D9C294 100%)",
      boxShadow: [
        `0 ${size*.06}px ${size*.18}px rgba(0,0,0,0.55)`,
        `0 ${size*.02}px ${size*.04}px rgba(0,0,0,0.35)`,
        `inset 0 ${size*.03}px ${size*.05}px rgba(255,255,255,0.9)`,
        `inset 0 -${size*.02}px ${size*.04}px rgba(0,0,0,0.15)`,
      ].join(", "),
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: face, height: face, borderRadius: faceR, overflow: "hidden",
        background: showCup
          ? `linear-gradient(145deg, #D96020 0%, ${SP_ORANGE} 40%, #9C3A0E 100%)`
          : "linear-gradient(145deg, #FBF3E2 0%, #EDE0C4 100%)",
        boxShadow: showCup
          ? `inset 0 2px 6px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,120,40,0.3)`
          : `inset 0 2px 4px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(200,85,26,0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {showCup
          ? <CupSVG size={face * 0.78} />
          : <img src="/images/tv/logo.png" alt="" style={{ width: face * 0.78, height: face * 0.78, objectFit: "cover", borderRadius: "50%" }} /> /* eslint-disable-line @next/next/no-img-element */
        }
      </div>
    </div>
  )
}

// ── Affiche Jeu de Dés ────────────────────────────────────────
const POKER_GREEN = "radial-gradient(circle at 40% 35%, #2d6e3e 0%, #1a4a28 60%, #0f2e18 100%)"
const POKER_SHADOW = "0 4px 24px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.07), 0 0 0 3px rgba(180,140,60,0.35)"

function DiceGameHeader() {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{
        fontFamily: FONT, fontSize: "0.8vw", letterSpacing: "0.28em",
        color: AMBER, textTransform: "uppercase", opacity: 0.8, marginBottom: "0.2vh",
      }}>
        défi du midi
      </p>
      <h2 style={{
        fontFamily: "'Almond Butter', cursive",
        fontSize: "3.8vw", color: CHALK, lineHeight: 1.2,
        letterSpacing: "-0.04em", margin: 0,
      }}>
        Jeu de Dés
      </h2>
    </div>
  )
}

function DiceGameContent() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ textAlign: "center", marginBottom: "0.5vh" }}>
        <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "1.4vw", letterSpacing: "0.12em", color: CHALK, opacity: 0.45 }}>
          Une tentative par table &amp; par service
        </p>
        <p style={{ fontFamily: FONT, fontSize: "1.4vw", letterSpacing: "0.12em", color: CHALK, opacity: 0.45, marginTop: "0.3vh" }}>
          Demandez les dés à l&rsquo;addition&nbsp;!
        </p>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "27vw", borderRadius: "9999px",
          background: POKER_GREEN, boxShadow: POKER_SHADOW,
          padding: "6vw 3vw",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "3vh",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
            <p style={{ fontFamily: FONT, fontSize: "1.9vw", fontWeight: 700, color: CHALK, textAlign: "center" }}>
              <span style={{ color: AMBER }}>→ </span>Le café est offert&nbsp;!
            </p>
            <div style={{ display: "flex", gap: "0.8vw" }}>
              <SPDie size={74} showCup /><SPDie size={74} showCup /><SPDie size={74} showCup />
            </div>
          </div>
          <div style={{ width: "70%", height: "1px", background: "rgba(242,237,228,0.2)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8vh" }}>
            <div style={{ display: "flex", gap: "0.8vw" }}>
              <SPDie size={74} showCup={false} /><SPDie size={74} showCup={false} /><SPDie size={74} showCup={false} />
            </div>
            <p style={{ fontFamily: FONT, fontSize: "1.9vw", fontWeight: 700, color: CHALK, textAlign: "center" }}>
              <span style={{ color: AMBER }}>→ </span>Le plat est offert&nbsp;!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Brique du jour ────────────────────────────────────────────
function DayCard({ titre, item }: { titre: string; item: DisplayItem | null }) {
  if (!item) return null
  return (
    <div style={{ padding: "0.6vh 0" }}>
      <h2 style={{
        fontFamily: FONT,
        fontSize: "1.9vw",
        fontWeight: 100,
        color: CHALK_DIM,
        lineHeight: 1.1,
        marginBottom: "0.3vh",
        letterSpacing: "-0.04em",
      }}>
        {titre}
      </h2>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: FONT, fontSize: "3.0vw", fontWeight: 700, color: CHALK }}>
            {item.name}
          </p>
          {item.description && (
            <p style={{ fontFamily: FONT, fontSize: "1.35vw", color: CHALK_DIM, lineHeight: 1.35 }}>
              {item.description}
            </p>
          )}
        </div>
        {item.prix > 0 && (
          <p style={{ fontFamily: FONT, fontSize: "1.9vw", fontWeight: 700, color: PRICE, marginLeft: "1.5vw", whiteSpace: "nowrap" }}>
            {item.prix.toFixed(1)} €
          </p>
        )}
      </div>
    </div>
  )
}

// ── Écran principal ───────────────────────────────────────────
function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (photos.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % photos.length)
        setVisible(true)
      }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [photos.length])

  if (photos.length === 0) return null

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[idx].url}
        alt=""
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />
    </div>
  )
}

export default function LunchScreen({ entree, plat, dessert, vins, showDice = true, photos = [] }: Props) {
  return (
    <MenuFrame theme="slate">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* ── LIGNE DE TITRES ── */}
        <div style={{ display: "flex", gap: "3vw" }}>
          {/* Titre gauche */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "'Almond Butter', cursive",
              fontSize: "3.8vw", color: CHALK,
              lineHeight: 1.2, paddingTop: 0, marginBottom: "0.3vh", letterSpacing: "-0.04em",
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
          {/* Titre droit */}
          {showDice && (
            <div style={{ width: "35%" }}>
              <DiceGameHeader />
            </div>
          )}
        </div>

        {/* ── LIGNE HORIZONTALE PARTAGÉE ── */}
        <div style={{ height: "1px", background: CHALK_LINE, margin: "1vh 0" }} />

        {/* ── CONTENU ── */}
        <div style={{ flex: 1, display: "flex", gap: "3vw", overflow: "hidden" }}>
          {/* Colonne gauche */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", paddingBottom: "3.2vw" }}>
            <DayCard titre="Entrée du jour"  item={entree} />
            <DayCard titre="Plat du jour"    item={plat} />
            <DayCard titre="Dessert du jour" item={dessert} />
            {vins.length === 0
              ? <DayCard titre="Vin du jour" item={null} />
              : vins.map((v, i) => <DayCard key={v.id} titre={i === 0 ? "Vin du jour" : ""} item={v} />)
            }
          </div>

          {showDice && <>
            <div style={{ width: "1px", background: CHALK_LINE, alignSelf: "stretch" }} />
            <div style={{ width: "35%", paddingBottom: "0.4vh" }}>
              <DiceGameContent />
            </div>
          </>}

          {!showDice && photos.length > 0 && <>
            <div style={{ width: "1px", background: CHALK_LINE, alignSelf: "stretch" }} />
            <div style={{ width: "35%", paddingBottom: "0.4vh" }}>
              <PhotoCarousel photos={photos} />
            </div>
          </>}
        </div>

      </div>
    </MenuFrame>
  )
}
