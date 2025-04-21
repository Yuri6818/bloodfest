// Game Entities
export interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  experience: number;
  health: {
    current: number;
    max: number;
  };
  mana?: {
    current: number;
    max: number;
  };
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    [key: string]: number;
  };
  inventory: Item[];
  equipment: Equipment;
  skills: {
    id: string;
    name: string;
    level: number;
    description: string;
  }[];
  gold: number;
  quests: {
    active: {
      id: string;
      name: string;
      description: string;
      progress: number;
      total: number;
    }[];
    completed: string[];
  };
  createdAt: string;
  lastLogin: string;
}

export type CharacterClass = 'warrior' | 'rogue' | 'mage';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';

export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  dexterity?: number;
  constitution?: number;
  wisdom?: number;
  charisma?: number;
  [key: string]: number | undefined;
}

// Items & Equipment
export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'amulet' | 'ring' | 'trinket' | 'consumable' | 'quest' | 'material';
  subtype?: string;
  rarity: ItemRarity;
  levelRequirement?: number;
  value: number;
  stats?: {
    damage?: number;
    damageType?: string;
    armor?: number;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    willpower?: number;
    health?: number;
    specialResourceBoost?: number;
    [key: string]: number | string | undefined;
  };
  effects?: ItemEffect[];
  requirements?: {
    level?: number;
    stats?: {
      [key: string]: number;
    };
    class?: string[];
  };
  classRestriction?: string[];
  lore?: string;
  imageUrl?: string;
}

export interface Equipment {
  [slot: string]: Item | null;
}

// Combat System
export interface ItemEffect {
  name?: string;
  description?: string;
  type: 'heal' | 'damage' | 'buff' | 'debuff' | 'passive' | 'on-hit' | 'on-kill';
  value: number;
  duration?: number;
  chance?: number;
}

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