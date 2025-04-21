import mongoose from 'mongoose';
import { Schema, model, Document, Types } from 'mongoose';

export type CharacterClass = 'Vampire' | 'Werewolf' | 'Necromancer' | 'Witch Hunter' | 'Cultist';

export interface Equipment {
  id: string;
  name: string;
  damage?: number;
  defense?: number;
}

export interface Skill {
  id: string;
  name: string;
  damage?: number;
  healing?: number;
  cost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  quantity: number;
  effect?: Record<string, number>;
  damage?: number;
  defense?: number;
}

export interface Appearance {
  hairStyle: string;
  hairColor: string;
  facialFeatures: string;
  skinTone: string;
  markings: string;
}

export interface ICharacter extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  willpower: number;
  bloodLust?: number;  // Vampire resource
  moonRage?: number;  // Werewolf resource
  soulEnergy?: number;  // Necromancer resource
  faithPower?: number;  // Witch Hunter resource
  corruption?: number;  // Cultist resource
  appearance?: Appearance;
  background?: string;
  abilities: string[];
  equippedItems?: {
    weapon: Types.ObjectId | null;
    armor: Types.ObjectId | null;
    amulet: Types.ObjectId | null;
    ring: Types.ObjectId | null;
    trinket: Types.ObjectId | null;
  };
  inventory: Types.ObjectId[];
  gold: number;
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
    },
    class: {
      type: String,
      required: true,
      enum: ['Vampire', 'Werewolf', 'Necromancer', 'Witch Hunter', 'Cultist']
    },
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    },
    health: {
      type: Number,
      required: true
    },
    maxHealth: {
      type: Number,
      required: true
    },
    strength: {
      type: Number,
      required: true
    },
    dexterity: {
      type: Number,
      required: true
    },
    intelligence: {
      type: Number,
      required: true
    },
    willpower: {
      type: Number,
      required: true
    },
    // Special resources
    bloodLust: Number,
    moonRage: Number,
    soulEnergy: Number,
    faithPower: Number,
    corruption: Number,
    // Appearance and background
    appearance: {
      hairStyle: String,
      hairColor: String,
      facialFeatures: String,
      skinTone: String,
      markings: String
    },
    background: String,
    // Equipment and inventory
    abilities: [String],
    equippedItems: {
      weapon: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      armor: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      amulet: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      ring: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      },
      trinket: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
      }
    },
    inventory: [{
      type: Schema.Types.ObjectId,
      ref: 'Item'
    }],
    gold: {
      type: Number,
      default: 100
    }
  },
  {
    timestamps: true
  }
);

export const Character = model<ICharacter>('Character', characterSchema);

// Define the character class interface that was missing
export interface ICharacterClass {
  name: string;
  description: string;
  baseStats: {
    health: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    willpower: number;
  };
  specialResource: {
    name: string;
    description: string;
    maxValue: number;
  };
  startingAbilities: string[];
  progression: Array<{
    level: number;
    ability: string;
    statBoost: {
      stat: string;
      amount: number;
    };
  }>;
}

// Pre-defined character classes
export const CharacterClasses: Record<string, ICharacterClass> = {
  Vampire: {
    name: 'Vampire',
    description: 'Immortal beings who feed on the blood of the living. They possess supernatural strength and speed but are vulnerable to sunlight and holy symbols.',
    baseStats: {
      health: 90,
      strength: 14,
      dexterity: 12,
      intelligence: 10,
      willpower: 8
    },
    specialResource: {
      name: 'Blood Lust',
      description: 'Vampires gain Blood Lust by feeding on enemies. This resource fuels their supernatural abilities.',
      maxValue: 100
    },
    startingAbilities: ['Blood Drain', 'Night Vision', 'Charm'],
    progression: [
      { level: 3, ability: 'Bat Form', statBoost: { stat: 'dexterity', amount: 2 } },
      { level: 5, ability: 'Blood Frenzy', statBoost: { stat: 'strength', amount: 3 } },
      { level: 7, ability: 'Mist Form', statBoost: { stat: 'maxHealth', amount: 20 } },
      { level: 10, ability: 'Dominate Mind', statBoost: { stat: 'intelligence', amount: 4 } }
    ]
  },
  Werewolf: {
    name: 'Werewolf',
    description: 'Shapeshifters cursed to transform under the moon\'s influence. They possess incredible strength and regeneration but struggle to control their bestial nature.',
    baseStats: {
      health: 120,
      strength: 15,
      dexterity: 13,
      intelligence: 8,
      willpower: 8
    },
    specialResource: {
      name: 'Moon Rage',
      description: 'Werewolves build Moon Rage during combat, unleashing increasingly powerful attacks as it grows.',
      maxValue: 100
    },
    startingAbilities: ['Rend', 'Heightened Senses', 'Regeneration'],
    progression: [
      { level: 3, ability: 'Pack Call', statBoost: { stat: 'strength', amount: 2 } },
      { level: 5, ability: 'Feral Leap', statBoost: { stat: 'dexterity', amount: 3 } },
      { level: 7, ability: 'Primal Fury', statBoost: { stat: 'maxHealth', amount: 30 } },
      { level: 10, ability: 'Alpha Form', statBoost: { stat: 'strength', amount: 5 } }
    ]
  },
  Necromancer: {
    name: 'Necromancer',
    description: 'Dark mages who manipulate the boundary between life and death. They command undead minions but are physically frail.',
    baseStats: {
      health: 70,
      strength: 6,
      dexterity: 8,
      intelligence: 15,
      willpower: 13
    },
    specialResource: {
      name: 'Soul Energy',
      description: 'Necromancers harvest Soul Energy from the fallen to fuel their dark magic.',
      maxValue: 100
    },
    startingAbilities: ['Raise Skeleton', 'Soul Siphon', 'Deathly Touch'],
    progression: [
      { level: 3, ability: 'Bone Armor', statBoost: { stat: 'maxHealth', amount: 15 } },
      { level: 5, ability: 'Command Undead', statBoost: { stat: 'intelligence', amount: 3 } },
      { level: 7, ability: 'Death Nova', statBoost: { stat: 'willpower', amount: 2 } },
      { level: 10, ability: 'Lich Form', statBoost: { stat: 'intelligence', amount: 5 } }
    ]
  },
  'Witch Hunter': {
    name: 'Witch Hunter',
    description: 'Holy warriors dedicated to eradicating supernatural evil. They wield blessed weapons and employ alchemical concoctions.',
    baseStats: {
      health: 100,
      strength: 12,
      dexterity: 14,
      intelligence: 10,
      willpower: 12
    },
    specialResource: {
      name: 'Faith Power',
      description: 'Witch Hunters channel Faith Power to bless their weapons and resist unholy magic.',
      maxValue: 100
    },
    startingAbilities: ['Silver Strike', 'Holy Water', 'Monster Lore'],
    progression: [
      { level: 3, ability: 'Purifying Flame', statBoost: { stat: 'willpower', amount: 2 } },
      { level: 5, ability: 'Banish Undead', statBoost: { stat: 'dexterity', amount: 2 } },
      { level: 7, ability: 'Divine Protection', statBoost: { stat: 'maxHealth', amount: 20 } },
      { level: 10, ability: 'Judgment', statBoost: { stat: 'strength', amount: 3 } }
    ]
  },
  Cultist: {
    name: 'Cultist',
    description: 'Devotees of forbidden elder gods who gain power through ritual sacrifice and blood magic, slowly losing their humanity.',
    baseStats: {
      health: 80,
      strength: 9,
      dexterity: 10,
      intelligence: 13,
      willpower: 12
    },
    specialResource: {
      name: 'Corruption',
      description: 'Cultists embrace Corruption to fuel their forbidden magic. Higher levels unlock darker powers but risk madness.',
      maxValue: 100
    },
    startingAbilities: ['Blood Sacrifice', 'Dark Whispers', 'Ritual Dagger'],
    progression: [
      { level: 3, ability: 'Tentacle Arm', statBoost: { stat: 'strength', amount: 2 } },
      { level: 5, ability: 'Madness Gaze', statBoost: { stat: 'intelligence', amount: 3 } },
      { level: 7, ability: 'Call of the Deep', statBoost: { stat: 'willpower', amount: 2 } },
      { level: 10, ability: 'Eldritch Transformation', statBoost: { stat: 'intelligence', amount: 4 } }
    ]
  }
}; 