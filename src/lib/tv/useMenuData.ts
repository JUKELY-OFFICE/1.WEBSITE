import { useState, useEffect } from "react"
import { supabase } from "@/api/supabaseClient"
import type { DisplayItem } from "@/types/tv"

export interface Photo {
  id:        string
  url:       string
  sortOrder: number
}

export interface MenuData {
  breakfastFormulas:  DisplayItem[]
  breakfastACarte:    DisplayItem[]
  breakfastOeufs:     DisplayItem[]
  lunchEntree:        DisplayItem | null
  lunchPlat:          DisplayItem | null
  lunchDessert:       DisplayItem | null
  lunchVins:          DisplayItem[]
  lwEntree:           DisplayItem | null
  lwPlat:             DisplayItem | null
  lwDessert:          DisplayItem | null
  lwVins:             DisplayItem[]
  hhCocktails:        DisplayItem[]
  hhBieres:           DisplayItem[]
  hhVins:             DisplayItem[]
  hhTapasSignature:   DisplayItem[]
  hhSpiritueux:       DisplayItem[]
  hhMessageBas:       DisplayItem | null
  aperoCocktails:     DisplayItem[]
  aperoBieres:        DisplayItem[]
  aperoVins:          DisplayItem[]
  aperoTapasSignature: DisplayItem[]
  aperoSpiritueux:    DisplayItem[]
  aperoMessageBas:    DisplayItem | null
  lwPhotos:           Photo[]
  aperoPhotos:        Photo[]
  lunchPhotos:        Photo[]
  happyHourPhotos:    Photo[]
  loading:            boolean
}

const VENUE_ID = "saint-placide"
const REFRESH_INTERVAL = 30_000

const EMPTY: MenuData = {
  breakfastFormulas: [], breakfastACarte: [], breakfastOeufs: [],
  lunchEntree: null, lunchPlat: null, lunchDessert: null, lunchVins: [],
  lwEntree: null, lwPlat: null, lwDessert: null, lwVins: [],
  hhCocktails: [], hhBieres: [], hhVins: [], hhTapasSignature: [], hhSpiritueux: [], hhMessageBas: null,
  aperoCocktails: [], aperoBieres: [], aperoVins: [], aperoTapasSignature: [], aperoSpiritueux: [], aperoMessageBas: null,
  lwPhotos: [],
  aperoPhotos: [],
  lunchPhotos: [],
  happyHourPhotos: [],
  loading: true,
}

export function useMenuData(): MenuData {
  const [data, setData] = useState<MenuData>(EMPTY)

  async function fetchAll() {
    const [{ data: rows }, { data: photoRows }] = await Promise.all([
      supabase.from("wf_display_items").select("*").eq("venue_id", VENUE_ID).eq("active", true).order("sort_order"),
      supabase.from("wf_photos").select("*").eq("venue_id", VENUE_ID).eq("active", true).order("sort_order"),
    ])

    const items: DisplayItem[] = (rows ?? []).map((r: any) => ({
      id:          r.id,
      name:        r.name,
      description: r.description ?? undefined,
      prix:        r.prix ?? 0,
      active:      r.active,
      sortOrder:   r.sort_order,
      page:        r.page,
      section:     r.section,
    }))

    const by = (page: string, section: string) =>
      items.filter(i => i.page === page && i.section === section)

    setData({
      breakfastFormulas: by("breakfast", "formules"),
      breakfastACarte:   by("breakfast", "a_la_carte"),
      breakfastOeufs:    by("breakfast", "oeufs"),
      lunchEntree:       by("lunch", "entree")[0]  ?? null,
      lunchPlat:         by("lunch", "plat")[0]    ?? null,
      lunchDessert:      by("lunch", "dessert")[0] ?? null,
      lunchVins:         by("lunch", "vin"),
      lwEntree:          by("lunch_weekend", "entree")[0]  ?? null,
      lwPlat:            by("lunch_weekend", "plat")[0]    ?? null,
      lwDessert:         by("lunch_weekend", "dessert")[0] ?? null,
      lwVins:            by("lunch_weekend", "vin"),
      hhCocktails:      by("happy_hour", "cocktails"),
      hhBieres:         by("happy_hour", "bieres"),
      hhVins:           by("happy_hour", "vins"),
      hhTapasSignature: by("happy_hour", "tapas_signature"),
      hhSpiritueux:     by("happy_hour", "spiritueux"),
      hhMessageBas:     by("happy_hour", "message_bas")[0] ?? null,
      aperoCocktails:     by("apero", "cocktails"),
      aperoBieres:        by("apero", "bieres"),
      aperoVins:          by("apero", "vins"),
      aperoTapasSignature: by("apero", "tapas_signature"),
      aperoSpiritueux:    by("apero", "spiritueux"),
      aperoMessageBas:    by("apero", "message_bas")[0] ?? null,
      lwPhotos: (photoRows ?? []).filter((r: any) => r.page === "lunch_weekend").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      aperoPhotos: (photoRows ?? []).filter((r: any) => r.page === "apero").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      lunchPhotos: (photoRows ?? []).filter((r: any) => r.page === "lunch_photo").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      happyHourPhotos: (photoRows ?? []).filter((r: any) => r.page === "happy_hour_photo").map((r: any) => ({
        id: r.id, url: r.url, sortOrder: r.sort_order,
      })),
      loading:           false,
    })
  }

  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return data
}
