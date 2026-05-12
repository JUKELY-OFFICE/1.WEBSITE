# Jukely.fr — Website Design Spec

**Date:** 2026-04-15  
**Project:** jukely.fr — Presentation website  
**Status:** Approved

---

## 1. Overview

Jukely is a software studio building modular solutions for independent restaurants and small groups. The website serves two audiences simultaneously:

- **Restaurateurs (prospects)** — understand the product, identify relevant modules, book a demo
- **Investors** — understand the model, the team, and the traction

---

## 2. Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Internationalisation:** `next-intl` — French (default) + English
- **Deployment:** Vercel
- **Font:** Inter (sans-serif)

---

## 3. Visual Style

- **Mode:** Dark by default
- **Palette:**
  - Background: near-black (`#0a0a0a` / `#111111`)
  - Surface: dark grey (`#1a1a1a` / `#222222`)
  - Text: off-white (`#f5f5f5`)
  - Accent: amber/orange (`#f59e0b` or `#f97316`) — warmth of restaurants + tech energy
- **Typography:** Inter, strong hierarchy (large headings, tight subtext)
- **Aesthetic:** Modern SaaS dark — clean, bold, minimal decoration

---

## 4. Site Structure

### Pages

| Route | Purpose |
|---|---|
| `/` | Long homepage with summary sections |
| `/modules` | Full brick catalogue |
| `/pricing` | Detailed pricing |
| `/about` | Team + vision |
| `/contact` | Contact form + info |

### i18n routing

- Default locale: French — served at `/` (no prefix)
- English locale — served at `/en/...`
- Language toggle in navbar switches between the two

---

## 5. Page Designs

### 5.1 Homepage `/`

Sections in order:

1. **Hero**
   - Tagline: "Des outils qui font le travail que votre PoS ne fait pas."
   - Sub-tagline: business model in one sentence
   - CTA primary: "Découvrir les briques" → `/modules`
   - CTA secondary: "Prendre RDV" → `/contact`

2. **Le problème** — 3 pain points presented as cards:
   - Admin time loss
   - Disconnected tools / silos
   - Inability to scale / pilot remotely

3. **La solution** — 3-column section explaining the modular concept:
   - You pay only for what you activate
   - Plugs into your existing PoS
   - Custom development available

4. **Les briques** — Preview of 3 modules (Menu Board TV, Pointage NFC/QR, KDS) with status badge (Active / En développement / Bientôt) + link to `/modules`

5. **Le pricing** — Summary of the model: Setup (500–2 500€ one-shot) + Monthly subscription per brick (40–150€/month) + link to `/pricing`

6. **À propos** — 2-line studio description + link to `/about`

7. **CTA final** — Full-width dark section: "Démarrer un pilote de 3 mois" → `/contact`

---

### 5.2 Modules page `/modules`

Full catalogue of bricks, grouped by status:

**Active**
- Menu Board TV: dynamic menu display on TV screens, multi-screen, real-time update from back-office

**En développement**
- Pointage équipes (NFC/QR): modern time-tracking on tablet, payroll export, HCR compliance

**Roadmap (bientôt)**
- KDS (Affichage Cuisine): kitchen display with real-time orders, prioritisation, timing
- Borne de commande self-service: self-order and payment kiosk
- Pilotage food cost: margin tracking per dish, supplier price alerts
- Dashboard manager: back-office TV with real-time revenue, vs. target, live covers

Each brick displayed as a card with: name, description, status badge, and a "En savoir plus" link (or "Contacter" CTA).

---

### 5.3 Pricing page `/pricing`

Three columns:

| | Setup | Mensuel | Sur-mesure |
|---|---|---|---|
| **Prix** | 500€ – 2 500€ | 40€ – 150€ / brique | Sur devis |
| **Ce que c'est** | Audit + install + formation | Par brique activée | Besoin hors catalogue |
| **Engagement** | One-shot | Sans engagement | Forfait |

Below: FAQ answering common objections (too expensive, no time, too small a startup).

---

### 5.4 About page `/about`

- Studio pitch: 2–3 sentences on Jukely's mission
- Team section: 2 placeholder cards (name TBD, role TBD, no photo for now)
- Values / differentiators: French, accessible, modular, custom-dev capable

---

### 5.5 Contact page `/contact`

- Simple form: Name, Email, Restaurant name, Message, Submit
- Below form: direct email address
- Optional: Calendly embed for booking a demo

---

## 6. Navigation

- Top navbar: Logo + links (Modules · Pricing · About · Contact) + language toggle (FR/EN)
- Mobile: hamburger menu
- Footer: links + legal mentions + © Jukely

---

## 7. Content Strategy

- All copy in both FR and EN via `next-intl` translation files (`messages/fr.json`, `messages/en.json`)
- Taglines and section copy written in the tone of the sales document: direct, concrete, no buzzwords
- Status badges on bricks: "Actif" (green), "En développement" (amber), "Bientôt" (grey)

---

## 8. Out of Scope

- Authentication / back-office
- CRM integration
- Payment / subscription management
- Blog
- Analytics (can be added later via Vercel Analytics)
