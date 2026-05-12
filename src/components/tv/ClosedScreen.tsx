// ============================================================
//  ÉCRAN FERMÉ — Affiché avant 7h et après 23h
// ============================================================

import { tvTheme } from "@/theme/tv"

export default function ClosedScreen() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(158deg, #0A1C2A 0%, #0F2535 50%, #0C1E2E 100%)" }}>

      {/* Fond botanique subtil */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(200,144,26,0.3) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 50%, rgba(15,60,80,0.5) 0%, transparent 60%)`,
        }} />

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center px-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm tracking-[0.4em] uppercase"
            style={{ color: "var(--cream-dark, #D4C4A8)", fontFamily: "var(--font-body)" }}>
            {tvTheme.address}
          </p>
          <h1 className="text-7xl font-black tracking-tight leading-none"
            style={{ fontFamily: "var(--font-title)", color: "var(--cream, #FAEEDE)" }}>
            THE SAINT<br />PLACIDE
          </h1>
        </div>

        {/* Séparateur doré */}
        <div className="w-32 h-px" style={{ background: "var(--gold, #C8901A)" }} />

        {/* Message fermé */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-3xl" style={{ fontFamily: "var(--font-cursive)", color: "var(--gold, #C8901A)" }}>
            On se retrouve demain
          </p>
          <p className="text-lg tracking-widest uppercase opacity-60"
            style={{ color: "var(--cream, #FAEEDE)", fontFamily: "var(--font-body)" }}>
            Petit déjeuner dès {tvTheme.schedule.breakfast.start}
          </p>
        </div>

        {/* Séparateur */}
        <div className="w-16 h-px opacity-30" style={{ background: "var(--cream, #FAEEDE)" }} />

        {/* Tags du restaurant */}
        <div className="flex gap-8 text-xs tracking-[0.3em] uppercase opacity-40"
          style={{ color: "var(--cream, #FAEEDE)", fontFamily: "var(--font-body)" }}>
          <span>Cuisine Maison</span>
          <span>·</span>
          <span>Service Continu</span>
          <span>·</span>
          <span>Happy Hour</span>
        </div>
      </div>
    </div>
  )
}
