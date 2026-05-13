export type ScreenMode = "breakfast" | "lunch" | "lunch_weekend" | "happy_hour" | "apero" | "closed"

export interface DisplayItem {
  id:          string
  name:        string
  description?: string
  prix:        number
  active:      boolean
  sortOrder:   number
  page:        string
  section:     string
}
export type ItemType = "food" | "cocktail" | "tapas" | "drink" | "wine" | "beer"
export type Tag = "breakfast" | "lunch" | "happy_hour"

export interface PriceVariants {
  [label: string]: number
}

export interface MenuItem {
  id:          string
  type:        ItemType
  name:        string
  description?: string
  price:       number | PriceVariants
  image?:      string
  tags:        Tag[]
  featured:    boolean
  active:      boolean
  sortOrder:   number
}

export interface BreakfastFormula {
  id:          string
  name:        string
  price:       number
  description: string
  items:       string[]
  active:      boolean
}
