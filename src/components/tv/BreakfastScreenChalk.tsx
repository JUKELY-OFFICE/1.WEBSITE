// ============================================================
//  ÉCRAN PETIT DÉJEUNER — VERSION ARDOISE FULL CRAIE
// ============================================================

import MenuFrame from "./MenuFrame"
import type { DisplayItem } from "@/types/tv"

interface Props {
  formules:  DisplayItem[]
  aCarte:    DisplayItem[]
  oeufs:     DisplayItem[]
}

const CHALK       = "#F2EDE4"
const CHALK_DIM   = "rgba(242,237,228,0.6)"
const CHALK_LINE  = "rgba(242,237,228,0.22)"
const PRICE       = "#E8C07A"
const FONT        = "var(--font-chalk), cursive"

export default function BreakfastScreenChalk({ formules, aCarte, oeufs }: Props) {
  const nF = formules.length
  const nR = aCarte.length + oeufs.length
  const fNameSz  = nF <= 3 ? 2.7  : nF <= 5 ? 2.3  : nF <= 7 ? 1.9  : 1.55
  const fPriceSz = nF <= 3 ? 2.8  : nF <= 5 ? 2.4  : nF <= 7 ? 2.0  : 1.65
  const fDescSz  = nF <= 3 ? 1.75 : nF <= 5 ? 1.5  : nF <= 7 ? 1.25 : 1.05
  const fPadV    = nF <= 3 ? 0.9  : nF <= 5 ? 0.6  : nF <= 7 ? 0.4  : 0.25
  const rNameSz  = nR <= 5 ? 2.1  : nR <= 8 ? 1.75 : nR <= 11 ? 1.4  : 1.15
  const rPriceSz = nR <= 5 ? 2.2  : nR <= 8 ? 1.85 : nR <= 11 ? 1.5  : 1.25
  const rDescSz  = nR <= 5 ? 1.5  : nR <= 8 ? 1.25 : nR <= 11 ? 1.05 : 0.88
  const rPadV    = nR <= 5 ? 0.6  : nR <= 8 ? 0.4  : nR <= 11 ? 0.28 : 0.18

  return (
    <MenuFrame theme="slate">
      <div style={{ display: "flex", gap: "3vw", height: "100%", overflow: "hidden" }}>

        {/* ── COLONNE GAUCHE ──────────────────────────── */}
        <div className="flex flex-col flex-1">

          <h1 style={{
            fontFamily: "'Almond Butter', cursive",
            fontSize: "3.8vw",
            color: CHALK,
            lineHeight: 1.2,
            paddingTop: 0,
            marginBottom: "0.3vh",
            letterSpacing: "-0.04em",
          }}>
            Formules Petit Déjeuner
          </h1>

          <p style={{
            fontFamily: FONT,
            fontSize: "1.2vw",
            letterSpacing: "0.2em",
            color: CHALK,
            opacity: 0.45,
            marginBottom: "1vh",
          }}>
            — de 7h à 11h30 —
          </p>

          <div style={{ height: "1px", background: CHALK_LINE, marginBottom: "0.8vh" }} />

          <div className="flex flex-col justify-between" style={{ flex: 1 }}>
            {formules.map((item) => (
              <div key={item.id}
                style={{ padding: `${fPadV}vh 0` }}>

                <div className="flex items-baseline justify-between" style={{ marginBottom: "0.2vh" }}>
                  <h3 style={{
                    fontFamily: FONT,
                    fontSize: `${fNameSz}vw`,
                    fontWeight: 700,
                    color: CHALK,
                    letterSpacing: "0.05em",
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    fontFamily: FONT,
                    fontSize: `${fPriceSz}vw`,
                    fontWeight: 700,
                    color: PRICE,
                    whiteSpace: "nowrap",
                  }}>
                    {item.prix.toFixed(1)} €
                  </span>
                </div>

                {item.description && (
                  <p style={{
                    fontFamily: FONT,
                    fontSize: `${fDescSz}vw`,
                    color: CHALK,
                    opacity: 0.82,
                    lineHeight: 1.4,
                  }}>
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur vertical */}
        <div style={{ width: "1px", background: CHALK_LINE, alignSelf: "stretch" }} />

        {/* ── COLONNE DROITE ──────────────────────────── */}
        <div className="flex flex-col" style={{ width: "35%", gap: "1.5vh" }}>

          {/* À la carte */}
          <div>
            <h2 style={{
              fontFamily: FONT,
              fontSize: "1.3vw",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: CHALK_DIM,
              paddingBottom: "0.6vh",
              borderBottom: `1px solid ${CHALK_LINE}`,
              marginBottom: "0.6vh",
              textTransform: "uppercase",
            }}>
              Petit Déjeuner
            </h2>

            {aCarte.map(item => (
              <div key={item.id} className="flex items-baseline justify-between"
                style={{ padding: `${rPadV}vh 0` }}>
                <div>
                  <span style={{ fontFamily: FONT, fontSize: `${rNameSz}vw`, color: CHALK }}>
                    {item.name}
                  </span>
                  {item.description && (
                    <span style={{ fontFamily: FONT, fontSize: `${rDescSz}vw`, color: CHALK_DIM, marginLeft: "0.4vw" }}>
                      {item.description}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: FONT, fontSize: `${rPriceSz}vw`, fontWeight: 700, color: PRICE, marginLeft: "0.5vw", whiteSpace: "nowrap" }}>
                  {item.prix.toFixed(1)} €
                </span>
              </div>
            ))}
          </div>

          {/* Œufs */}
          <div>
            <h2 style={{
              fontFamily: FONT,
              fontSize: "1.3vw",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: CHALK_DIM,
              paddingBottom: "0.6vh",
              borderBottom: `1px solid ${CHALK_LINE}`,
              marginBottom: "0.6vh",
              textTransform: "uppercase",
            }}>
              Les Œufs{" "}
              <span style={{ textTransform: "none", letterSpacing: "normal", fontWeight: 400, opacity: 0.6 }}>
                · 7h30–11h30
              </span>
            </h2>

            {oeufs.map(item => (
              <div key={item.id} className="flex items-baseline justify-between"
                style={{ padding: `${rPadV}vh 0` }}>
                <div>
                  <span style={{ fontFamily: FONT, fontSize: `${rNameSz}vw`, color: CHALK }}>
                    {item.name}
                  </span>
                  {item.description && (
                    <span style={{ fontFamily: FONT, fontSize: `${rDescSz}vw`, color: CHALK_DIM, marginLeft: "0.4vw" }}>
                      {item.description}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: FONT, fontSize: `${rPriceSz}vw`, fontWeight: 700, color: PRICE, marginLeft: "0.5vw", whiteSpace: "nowrap" }}>
                  {item.prix.toFixed(1)} €
                </span>
              </div>
            ))}
          </div>

          {/* Bonhomme */}
          <div className="flex-1 relative" style={{ minHeight: "12vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tv/bonhomme.png"
              alt="Bonhomme baguette"
              style={{
                position: "absolute", inset: 0,
                bottom: "-3.2vw",
                width: "100%", height: "calc(100% + 3.2vw)",
                objectFit: "contain", objectPosition: "center bottom",
                filter: "brightness(0) invert(1) opacity(0.85)",
              }}
            />
          </div>
        </div>
      </div>
    </MenuFrame>
  )
}
