// ============================================================
//  ÉCRAN PETIT DÉJEUNER — Optimisé TV 1920×1080
// ============================================================

import MenuFrame from "./MenuFrame"
import type { MenuItem, BreakfastFormula } from "@/types/tv"

interface Props {
  breakfastFormulas: BreakfastFormula[]
  breakfastItems: MenuItem[]
}

// ── THÈME ARDOISE ────────────────────────────────────────────
const CHALK       = "#F2EDE4"          // blanc craie
const CHALK_DIM   = "rgba(242,237,228,0.55)"
const CHALK_FAINT = "rgba(242,237,228,0.12)"
const CHALK_LINE  = "rgba(242,237,228,0.2)"
const PRICE       = "#E8A87C"          // orange craie chaud

export default function BreakfastScreen({ breakfastFormulas, breakfastItems }: Props) {
  const eggs   = breakfastItems.filter(i => ["oeufs","omelette-nature","omelette-jamfrom"].includes(i.id))
  const drinks = breakfastItems.filter(i => i.type === "drink")
  const bites  = breakfastItems.filter(i => i.type === "food" && !eggs.includes(i))

  const translations: Record<string, string> = {
    basique:   "Hot drink, bread, butter, jam, orange juice 12cl",
    gourmand:  "Hot drink, bread, butter, jam, one croissant, squeezed orange juice 12cl",
    audacieux: "Hot drink, croissant, fried eggs with bacon, squeezed orange juice 12cl",
    brunch:    "Hot drink, croissant, fried eggs with bacon, seasonal fruits, cottage cheese, muesli, avocado toast, tomato",
  }

  return (
    <MenuFrame theme="slate">
      <div className="flex h-full overflow-hidden" style={{ gap: "3vw" }}>

        {/* ── COLONNE GAUCHE : Formules ──────────────── */}
        <div className="flex flex-col flex-1">

          {/* Titre */}
          <h1 style={{ fontFamily: "'Almond Butter', cursive", fontSize: "3.8vw", color: CHALK, lineHeight: 1.2, paddingTop: "0.3vh", marginBottom: "0.4vh", letterSpacing: "-0.04em" }}>
            Formules Petit Déjeuner
          </h1>
          <p style={{ fontSize: "0.72vw", letterSpacing: "0.3em", color: CHALK, fontFamily: "var(--font-body)", opacity: 0.4, marginBottom: "1vh" }}>
            — DE 7H À 11H30 —
          </p>
          <div style={{ height: "1px", background: CHALK_LINE, marginBottom: "0.8vh" }} />

          {/* Formules */}
          <div className="flex flex-col justify-between" style={{ flex: "0 0 68%" }}>
            {breakfastFormulas.filter(f => f.active).map((formula, idx, arr) => (
              <div key={formula.id}
                style={{ padding: "1vh 0", borderBottom: idx < arr.length - 1 ? `1px solid ${CHALK_LINE}` : "none" }}>
                <div className="flex items-baseline justify-between" style={{ marginBottom: "0.3vh" }}>
                  <h3 style={{ fontFamily: "var(--font-body)", fontSize: "1.4vw", fontWeight: 700, color: CHALK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {formula.name}
                  </h3>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "1.5vw", fontWeight: 700, color: PRICE, whiteSpace: "nowrap" }}>
                    {formula.price.toFixed(1)} €
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.92vw", color: CHALK, opacity: 0.8, lineHeight: 1.45 }}>
                  {formula.items.join(", ")}
                </p>
                <p className="italic" style={{ fontFamily: "var(--font-body)", fontSize: "0.75vw", color: CHALK_DIM, lineHeight: 1.4, marginTop: "0.15vh" }}>
                  {translations[formula.id]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur vertical */}
        <div style={{ width: "1px", background: CHALK_LINE, alignSelf: "stretch" }} />

        {/* ── COLONNE DROITE : À la carte + Œufs + Bonhomme ── */}
        <div className="flex flex-col" style={{ width: "35%", gap: "1.5vh" }}>

          {/* À la carte */}
          <div>
            <h2 style={{ fontFamily: "var(--font-body)", fontSize: "0.8vw", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: CHALK_DIM, paddingBottom: "0.7vh", borderBottom: `1px solid ${CHALK_LINE}`, marginBottom: "0.7vh" }}>
              Petit Déjeuner
            </h2>
            {[...drinks, ...bites].map(item => (
              <div key={item.id} className="flex items-baseline justify-between"
                style={{ padding: "0.7vh 0", borderBottom: `1px solid ${CHALK_FAINT}` }}>
                <div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "1.05vw", color: CHALK }}>{item.name}</span>
                  {item.description && (
                    <span className="italic" style={{ fontFamily: "var(--font-body)", fontSize: "0.72vw", color: CHALK_DIM, marginLeft: "0.4vw" }}>{item.description}</span>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1.05vw", fontWeight: 600, color: PRICE, marginLeft: "1.5vw", whiteSpace: "nowrap" }}>
                  {(item.price as number).toFixed(1)} €
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: CHALK_LINE }} />

          {/* Œufs */}
          <div>
            <h2 style={{ fontFamily: "var(--font-body)", fontSize: "0.8vw", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: CHALK_DIM, paddingBottom: "0.7vh", borderBottom: `1px solid ${CHALK_LINE}`, marginBottom: "0.7vh" }}>
              Les Œufs <span style={{ textTransform: "none", letterSpacing: "normal", fontWeight: 400, opacity: 0.6 }}>· 7h30–11h30</span>
            </h2>
            {eggs.map(item => (
              <div key={item.id} className="flex items-baseline justify-between"
                style={{ padding: "0.7vh 0", borderBottom: `1px solid ${CHALK_FAINT}` }}>
                <div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "1.05vw", color: CHALK }}>{item.name}</span>
                  {item.description && (
                    <span className="italic" style={{ fontFamily: "var(--font-body)", fontSize: "0.72vw", color: CHALK_DIM, marginLeft: "0.4vw" }}>{item.description}</span>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1.05vw", fontWeight: 600, color: PRICE, marginLeft: "1.5vw", whiteSpace: "nowrap" }}>
                  {(item.price as number).toFixed(1)} €
                </span>
              </div>
            ))}
          </div>

          {/* Bonhomme — blanc craie */}
          <div className="flex-1 relative" style={{ minHeight: "10vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tv/bonhomme.png"
              alt="Bonhomme baguette"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", filter: "brightness(0) invert(1) opacity(0.85)" }}
            />
          </div>
        </div>
      </div>
    </MenuFrame>
  )
}
