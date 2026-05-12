export type BrickStatus = 'active' | 'dev' | 'soon';

export interface Brick {
  id: string;
  nameKey: string;
  descKey: string;
  status: BrickStatus;
}

export const BRICKS: Brick[] = [
  {
    id: 'menu-board-tv',
    nameKey: 'menuBoardTV',
    descKey: 'menuBoardTVDesc',
    status: 'active',
  },
  {
    id: 'pointage-nfc',
    nameKey: 'pointageNFC',
    descKey: 'pointageNFCDesc',
    status: 'dev',
  },
  {
    id: 'kds',
    nameKey: 'kds',
    descKey: 'kdsDesc',
    status: 'soon',
  },
  {
    id: 'borne-commande',
    nameKey: 'borneCommande',
    descKey: 'borneCommandeDesc',
    status: 'soon',
  },
  {
    id: 'food-cost',
    nameKey: 'foodCost',
    descKey: 'foodCostDesc',
    status: 'soon',
  },
  {
    id: 'dashboard-manager',
    nameKey: 'dashboardManager',
    descKey: 'dashboardManagerDesc',
    status: 'soon',
  },
];

export const PREVIEW_BRICKS = BRICKS.slice(0, 3);
