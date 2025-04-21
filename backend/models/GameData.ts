export interface Enemy {
  id: string;
  name: string;
  health: number;
  damage: number;
  xp: number;
  gold: number;
  level: number;
  description?: string;
  abilities?: string[];
  dropRate?: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  enemies: string[]; // enemy ids
  minLevel: number;
  background?: string;
  dangers?: string[];
  rewards?: {
    gold?: number;
    xp?: number;
    items?: string[];
  };
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  cost: number;
  level?: number;
  effect?: Record<string, number>;
  damage?: number;
  defense?: number;
  requirements?: {
    level?: number;
    class?: string[];
    strength?: number;
    intelligence?: number;
    dexterity?: number;
  };
}

export interface GameData {
  enemies: Enemy[];
  locations: Location[];
  items: Item[];
}

// Example game data
export const gameData: GameData = {
  enemies: [
    { id: 'en001', name: 'Zombie', health: 50, damage: 5, xp: 20, gold: 15, level: 1 },
    { id: 'en002', name: 'Skeleton', health: 40, damage: 7, xp: 25, gold: 20, level: 2 },
    { id: 'en003', name: 'Ghost', health: 30, damage: 10, xp: 30, gold: 25, level: 3 },
    { id: 'en004', name: 'Vampire', health: 80, damage: 12, xp: 50, gold: 40, level: 5 }
  ],
  locations: [
    { 
      id: 'loc001', 
      name: 'Dark Forest', 
      description: 'A dense forest shrouded in mist, with twisted trees that block out the sunlight.',
      enemies: ['en001', 'en002'],
      minLevel: 1
    },
    { 
      id: 'loc002', 
      name: 'Haunted Mansion', 
      description: 'An abandoned mansion said to be haunted by the spirits of its former occupants.',
      enemies: ['en002', 'en003'],
      minLevel: 2
    },
    { 
      id: 'loc003', 
      name: 'Ancient Crypt', 
      description: 'A crypt dating back centuries, filled with the remains of long-dead nobles.',
      enemies: ['en003', 'en004'],
      minLevel: 4
    }
  ],
  items: [
    { id: 'it001', name: 'Health Potion', effect: { health: 25 }, cost: 15, type: 'consumable' },
    { id: 'it002', name: 'Mana Potion', effect: { mana: 25 }, cost: 15, type: 'consumable' },
    { id: 'it003', name: 'Steel Sword', damage: 12, cost: 100, type: 'weapon' },
    { id: 'it004', name: 'Chain Mail', defense: 8, cost: 120, type: 'armor' },
    { id: 'it005', name: 'Amulet of Protection', effect: { defense: 3 }, cost: 150, type: 'accessory' }
  ]
}; 