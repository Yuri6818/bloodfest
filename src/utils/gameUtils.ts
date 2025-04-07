import type { Character, CharacterStats, ItemEffect, Enemy, Item, CharacterClass, ItemRarity } from '../types/game';

export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

export const validateStats = (stats: CharacterStats): boolean => {
  return (
    stats.strength >= 0 &&
    stats.agility >= 0 &&
    stats.intelligence >= 0 &&
    stats.vitality >= 0
  );
};

export const calculateDamage = (
  attacker: Character | Enemy,
  defender: Character | Enemy,
  baseDamage: number,
  effects: ItemEffect[] = []
): number => {
  if (baseDamage < 0) throw new GameError('Base damage cannot be negative');

  let damage = baseDamage;
  
  // Apply attacker's stats if it's a character
  if ('stats' in attacker) {
    if (!validateStats(attacker.stats)) {
      throw new GameError('Invalid attacker stats');
    }
    damage *= 1 + (attacker.stats.strength * 0.1);
  }

  // Apply defender's defense
  if ('stats' in defender) {
    if (!validateStats(defender.stats)) {
      throw new GameError('Invalid defender stats');
    }
    damage *= 1 - (defender.stats.vitality * 0.05);
  } else {
    if (defender.defense < 0) throw new GameError('Defense cannot be negative');
    damage *= 1 - (defender.defense * 0.05);
  }

  // Apply effects
  effects.forEach(effect => {
    if (effect.value < 0) throw new GameError('Effect value cannot be negative');
    if (effect.type === 'buff') {
      damage *= (1 + effect.value);
    } else if (effect.type === 'debuff') {
      damage *= (1 - effect.value);
    }
  });

  return Math.max(1, Math.round(damage));
};

export const calculateExperienceToLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateStatGrowth = (
  baseStats: CharacterStats,
  level: number,
  characterClass: CharacterClass
): CharacterStats => {
  if (level < 1) throw new GameError('Level must be at least 1');
  if (!validateStats(baseStats)) throw new GameError('Invalid base stats');

  const growthRates = {
    warrior: { strength: 2.5, agility: 1.5, intelligence: 1, vitality: 2 },
    rogue: { strength: 1.5, agility: 2.5, intelligence: 1.5, vitality: 1.5 },
    mage: { strength: 1, agility: 1.5, intelligence: 2.5, vitality: 1.5 }
  };

  const growth = growthRates[characterClass];
  const levelMultiplier = level - 1;

  return {
    strength: Math.floor(baseStats.strength + (growth.strength * levelMultiplier)),
    agility: Math.floor(baseStats.agility + (growth.agility * levelMultiplier)),
    intelligence: Math.floor(baseStats.intelligence + (growth.intelligence * levelMultiplier)),
    vitality: Math.floor(baseStats.vitality + (growth.vitality * levelMultiplier))
  };
};

export const calculateMaxHealth = (stats: CharacterStats): number => {
  return 100 + (stats.vitality * 10);
};

export const calculateMaxEnergy = (stats: CharacterStats): number => {
  return 50 + (stats.intelligence * 5);
};

export const calculateHitChance = (
  attacker: Character | Enemy,
  defender: Character | Enemy
): number => {
  const baseHitChance = 85;
  let hitChance = baseHitChance;

  if ('stats' in attacker && 'stats' in defender) {
    if (!validateStats(attacker.stats) || !validateStats(defender.stats)) {
      throw new GameError('Invalid character stats');
    }
    hitChance += (attacker.stats.agility * 2) - (defender.stats.agility * 1.5);
  }

  return Math.min(95, Math.max(50, hitChance));
};

export const applyEffects = (
  target: Character,
  effects: ItemEffect[]
): Character => {
  if (!target) throw new GameError('Invalid target');
  if (!Array.isArray(effects)) throw new GameError('Effects must be an array');

  const updatedTarget = { ...target };

  effects.forEach(effect => {
    if (effect.value < 0) throw new GameError('Effect value cannot be negative');
    
    switch (effect.type) {
      case 'heal':
        updatedTarget.health = Math.min(
          updatedTarget.maxHealth,
          updatedTarget.health + effect.value
        );
        break;
      case 'damage':
        updatedTarget.health = Math.max(
          0,
          updatedTarget.health - effect.value
        );
        break;
      case 'buff':
      case 'debuff':
        // Buffs and debuffs are handled in combat calculations
        break;
      default:
        throw new GameError(`Unknown effect type: ${effect.type}`);
    }
  });

  return updatedTarget;
};

export const generateLoot = (enemy: Enemy): Item[] => {
  if (!enemy) throw new GameError('Invalid enemy');
  if (enemy.level < 1) throw new GameError('Enemy level must be at least 1');

  const rarityChances: Record<ItemRarity, number> = {
    common: 0.6,
    uncommon: 0.25,
    rare: 0.1,
    epic: 0.04,
    legendary: 0.01
  };

  const determineRarity = (): ItemRarity => {
    const roll = Math.random();
    let cumulativeChance = 0;
    
    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulativeChance += chance;
      if (roll <= cumulativeChance) return rarity as ItemRarity;
    }
    
    return 'common';
  };

  const numberOfItems = Math.floor(Math.random() * 3) + 1;
  const loot: Item[] = [];

  for (let i = 0; i < numberOfItems; i++) {
    const rarity = determineRarity();
    // Placeholder for actual item generation logic
    loot.push({
      id: `${Date.now()}-${i}`,
      name: `Level ${enemy.level} ${rarity} Item`,
      description: `A ${rarity} item dropped by level ${enemy.level} enemy`,
      type: 'weapon',
      rarity,
      value: Math.floor(enemy.level * 10 * (1 + Object.keys(rarityChances).indexOf(rarity)))
    });
  }

  return loot;
};

export const calculateEnemyStats = (level: number): Enemy => {
  if (level < 1) throw new GameError('Enemy level must be at least 1');

  const baseStats = {
    health: 50,
    damage: 5,
    defense: 2,
    experience: 20
  };

  const multiplier = 1 + (level * 0.2);
  const health = Math.floor(baseStats.health * multiplier);

  return {
    id: Date.now().toString(),
    name: generateEnemyName(level),
    level,
    health,
    maxHealth: health,
    damage: Math.floor(baseStats.damage * multiplier),
    defense: Math.floor(baseStats.defense * multiplier),
    experience: Math.floor(baseStats.experience * multiplier)
  };
};

const generateEnemyName = (level: number): string => {
  const prefixes = ['Fierce', 'Dark', 'Cursed', 'Ancient', 'Corrupted'];
  const types = ['Warrior', 'Beast', 'Demon', 'Specter', 'Dragon'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return `${prefix} ${type}`;
};