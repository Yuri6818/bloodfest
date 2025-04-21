import { Schema, model, Document, Types } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'amulet' | 'ring' | 'trinket' | 'consumable';
  subtype?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';
  levelRequirement: number;
  value: number;
  stats: {
    damage?: number;
    damageType?: string;
    armor?: number;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    willpower?: number;
    health?: number;
    specialResourceBoost?: number;
  };
  effects: {
    name: string;
    description: string;
    type: string;
    value: number;
    duration?: number;
    chance?: number;
  }[];
  classRestriction?: string[];
  lore?: string;
  imageUrl?: string;
}

const itemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['weapon', 'armor', 'amulet', 'ring', 'trinket', 'consumable'] 
  },
  subtype: String,
  rarity: { 
    type: String, 
    required: true, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact'],
    default: 'common'
  },
  levelRequirement: { type: Number, default: 1 },
  value: { type: Number, default: 0 },
  stats: {
    damage: Number,
    damageType: String,
    armor: Number,
    strength: Number,
    dexterity: Number,
    intelligence: Number,
    willpower: Number,
    health: Number,
    specialResourceBoost: Number
  },
  effects: [{
    name: String,
    description: String,
    type: String,
    value: Number,
    duration: Number,
    chance: Number
  }],
  classRestriction: [String],
  lore: String,
  imageUrl: String
});

export const Item = model<IItem>('Item', itemSchema);

// Pre-defined iconic items
export const IconicItems = [
  // Legendary Weapons
  {
    name: "Bloodthirster",
    description: "An ancient blade that thirsts for blood and grows stronger with each kill.",
    type: "weapon",
    subtype: "sword",
    rarity: "legendary",
    levelRequirement: 8,
    value: 2500,
    stats: {
      damage: 45,
      damageType: "physical",
      strength: 5
    },
    effects: [{
      name: "Blood Harvest",
      description: "Each kill restores 10 health and increases damage by 2% for 30 seconds (stacks up to 5 times)",
      type: "on-kill",
      value: 10,
      duration: 30
    }],
    classRestriction: ["Vampire"],
    lore: "Forged by the ancient vampire lord Valorian from the blood of a thousand victims, this blade has an insatiable thirst that mirrors its wielder's."
  },
  {
    name: "Silver Moonblade",
    description: "A silver blade that channels the power of the full moon, especially deadly in werewolf hands.",
    type: "weapon",
    subtype: "curved sword",
    rarity: "legendary",
    levelRequirement: 8,
    value: 2800,
    stats: {
      damage: 40,
      damageType: "silver",
      dexterity: 6
    },
    effects: [{
      name: "Lunar Blessing",
      description: "Damage increases by 20% during night time. Generates 10% more Moon Rage.",
      type: "passive",
      value: 20
    }],
    classRestriction: ["Werewolf"],
    lore: "Crafted from a meteorite of pure silver that fell during a blood moon, this blade allows werewolves to channel their curse into focused power."
  },
  {
    name: "Staff of Eternal Rest",
    description: "A staff crowned with a human skull that channels necrotic energies.",
    type: "weapon",
    subtype: "staff",
    rarity: "legendary",
    levelRequirement: 8,
    value: 2600,
    stats: {
      damage: 35,
      damageType: "necrotic",
      intelligence: 8
    },
    effects: [{
      name: "Soul Harvest",
      description: "When you kill an enemy, there's a 25% chance to raise them as a skeleton minion for 60 seconds.",
      type: "on-kill",
      value: 1,
      duration: 60,
      chance: 25
    }],
    classRestriction: ["Necromancer"],
    lore: "The skull atop this staff belongs to the first necromancer, who willingly sacrificed himself to create a conduit between the realms of life and death."
  },
  
  // Epic Armors
  {
    name: "Nightweave Cloak",
    description: "A cloak woven from shadows that seems to disappear in darkness.",
    type: "armor",
    subtype: "cloak",
    rarity: "epic",
    levelRequirement: 6,
    value: 1800,
    stats: {
      armor: 18,
      dexterity: 5,
      willpower: 3
    },
    effects: [{
      name: "Shadow Step",
      description: "15% chance to become invisible for 3 seconds when hit by an attack.",
      type: "on-hit",
      value: 3,
      duration: 3,
      chance: 15
    }],
    classRestriction: ["Vampire", "Cultist"],
    lore: "The threads of this cloak were harvested from the shadows of those who died at midnight, giving it the ability to bend light around its wearer."
  },
  {
    name: "Beastplate Harness",
    description: "A harness made from the hide of an alpha werewolf, reinforced with bone plates.",
    type: "armor",
    subtype: "chest",
    rarity: "epic",
    levelRequirement: 6,
    value: 1600,
    stats: {
      armor: 25,
      strength: 4,
      health: 20
    },
    effects: [{
      name: "Bestial Resilience",
      description: "Take 15% less damage when below 30% health. Gain 5 Moon Rage when hit.",
      type: "passive",
      value: 15
    }],
    classRestriction: ["Werewolf"],
    lore: "Created from the remains of the legendary werewolf Greymane, it's said the spirit of the great alpha still lingers in the hide, protecting its wearer."
  },
  
  // Rare Amulets and Rings
  {
    name: "Crimson Tear Pendant",
    description: "A teardrop-shaped ruby that pulses like a beating heart.",
    type: "amulet",
    rarity: "rare",
    levelRequirement: 4,
    value: 950,
    stats: {
      intelligence: 3,
      health: 15,
      specialResourceBoost: 10
    },
    effects: [{
      name: "Blood Resonance",
      description: "Your Blood Lust abilities cost 15% less to use.",
      type: "passive",
      value: 15
    }],
    classRestriction: ["Vampire"],
    lore: "This gemstone formed when the tears of a dying vampire crystallized as they wept for their lost humanity."
  },
  {
    name: "Ring of Blessed Silver",
    description: "A silver ring inscribed with holy symbols that glows faintly in the presence of dark magic.",
    type: "ring",
    rarity: "rare",
    levelRequirement: 4,
    value: 880,
    stats: {
      willpower: 4,
      specialResourceBoost: 10
    },
    effects: [{
      name: "Holy Protection",
      description: "Reduces damage from undead and vampires by 20%.",
      type: "passive",
      value: 20
    }],
    classRestriction: ["Witch Hunter"],
    lore: "Blessed by the Archbishop of St. Alban's Cathedral, these rings are given to witch hunters who have proven their devotion to eradicating darkness."
  },
  
  // Uncommon Trinkets
  {
    name: "Vial of Elder Blood",
    description: "A small vial containing the viscous black blood of an elder god.",
    type: "trinket",
    rarity: "uncommon",
    levelRequirement: 3,
    value: 450,
    stats: {
      intelligence: 2,
      willpower: -1
    },
    effects: [{
      name: "Forbidden Knowledge",
      description: "Your damaging abilities have a 8% chance to cause Madness (Confusion) in enemies for 4 seconds.",
      type: "on-hit",
      value: 4,
      duration: 4,
      chance: 8
    }],
    classRestriction: ["Cultist", "Necromancer"],
    lore: "Extracted from the veins of a sleeping elder god by cultists who paid with their sanity, this blood contains fragments of cosmic knowledge."
  },
  
  // Common Consumables
  {
    name: "Crimson Vial",
    description: "A vial filled with fresh blood. Restores health and Blood Lust.",
    type: "consumable",
    subtype: "potion",
    rarity: "common",
    levelRequirement: 1,
    value: 25,
    stats: {},
    effects: [{
      name: "Blood Restoration",
      description: "Restores 40 health and 20 Blood Lust instantly.",
      type: "instant",
      value: 40
    }],
    classRestriction: ["Vampire"],
    lore: "A standard supply for traveling vampires, these vials are carefully preserved to maintain the blood's potency."
  },
  {
    name: "Wolfsbane Tincture",
    description: "A bitter herbal mixture that helps werewolves maintain control during transformation.",
    type: "consumable",
    subtype: "potion",
    rarity: "common",
    levelRequirement: 1,
    value: 30,
    stats: {},
    effects: [{
      name: "Beast Control",
      description: "Reduces Moon Rage by 40 points but restores 25 health.",
      type: "instant",
      value: 40
    }],
    classRestriction: ["Werewolf"],
    lore: "Brewed from the rare wolfsbane flower that grows only under a waning moon, this bitter drink helps werewolves maintain their humanity."
  }
];
