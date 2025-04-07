// Game Entities
export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stats: CharacterStats;
  inventory: Item[];
  equipment: Equipment;
  skills: CombatSkill[];
}

export type CharacterClass = 'warrior' | 'rogue' | 'mage';

export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
}

// Items & Equipment
export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  imageUrl?: string;
  stats?: Partial<CharacterStats>;
  effects?: ItemEffect[];
  value: number;
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemEffect {
  type: EffectType;
  value: number;
  duration?: number;
}

export type EffectType = 'heal' | 'damage' | 'buff' | 'debuff';

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

// Combat System
export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  damage?: number;
  healing?: number;
  energyCost: number;
  cooldown: number;
  effects?: ItemEffect[];
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  experience: number;
  loot?: Item[];
}

// Quest System
export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  objectives?: QuestObjective[];
  rewards: {
    experience: number;
    items?: Array<string | Item>;
    gold?: number;
  };
  requirements: {
    level: number;
    items?: Array<string | Item>;
  };
  progress?: QuestProgress;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'explore';
  target: string;
  required: number;
  current?: number;
}

export interface QuestProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  objectives: Record<string, number>; // objectiveId -> current progress
  updatedAt: string;
}