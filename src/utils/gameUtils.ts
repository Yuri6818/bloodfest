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

/**
 * Calculate how stats grow when a character levels up
 */
export const calculateStatGrowth = (
  currentStats: CharacterStats,
  newLevel: number,
  characterClass: string
): CharacterStats => {
  // Base stat growth factors by class
  const growthFactors: Record<string, Partial<CharacterStats>> = {
    warrior: {
      strength: 2.5,
      agility: 1.2, 
      intelligence: 0.8,
      vitality: 2.0
    },
    rogue: {
      strength: 1.5,
      agility: 2.5,
      intelligence: 1.2,
      vitality: 1.0
    },
    mage: {
      strength: 0.8,
      agility: 1.0,
      intelligence: 2.5,
      vitality: 1.0
    }
  };
  
  // Get growth factors for the character's class, default to balanced
  const factors = growthFactors[characterClass] || {
    strength: 1.5,
    agility: 1.5,
    intelligence: 1.5,
    vitality: 1.5
  };
  
  // Calculate new stats with growth
  return {
    strength: Math.floor(currentStats.strength + factors.strength!),
    agility: Math.floor(currentStats.agility + factors.agility!),
    intelligence: Math.floor(currentStats.intelligence + factors.intelligence!),
    vitality: Math.floor(currentStats.vitality + factors.vitality!)
  };
};

/**
 * Calculate max health based on stats
 */
export const calculateMaxHealth = (stats: CharacterStats): number => {
  return 100 + (stats.vitality * 10);
};

/**
 * Calculate max energy based on stats
 */
export const calculateMaxEnergy = (stats: CharacterStats): number => {
  return 50 + (stats.intelligence * 5) + (stats.vitality * 2);
};

/**
 * Level up a character
 */
export const levelUpCharacter = (character: Character): Character => {
  const newLevel = character.level + 1;
  
  // Calculate new stats
  const newStats = {
    ...character.stats,
    ...calculateStatGrowth(character.stats as CharacterStats, newLevel, character.class)
  };
  
  // Calculate new health and energy
  const maxHealth = calculateMaxHealth(newStats as CharacterStats);
  
  // Return the updated character
  return {
    ...character,
    level: newLevel,
    stats: newStats,
    health: {
      current: maxHealth,
      max: maxHealth
    },
    experience: 0, // Reset experience for next level
  };
};

/**
 * Check if a character has enough experience to level up
 */
export const canLevelUp = (character: Character): boolean => {
  const requiredExp = calculateRequiredExperience(character.level);
  return character.experience >= requiredExp;
};

/**
 * Calculate required experience for the next level
 */
export const calculateRequiredExperience = (currentLevel: number): number => {
  // Simple calculation: 100 * level^2
  return 100 * Math.pow(currentLevel, 2);
};

/**
 * Add experience to a character, handling level ups
 */
export const addExperience = (character: Character, amount: number): Character => {
  let updatedCharacter = {
    ...character,
    experience: character.experience + amount
  };
  
  // Check if the character can level up
  const requiredExp = calculateRequiredExperience(updatedCharacter.level);
  if (updatedCharacter.experience >= requiredExp) {
    updatedCharacter = levelUpCharacter(updatedCharacter);
  }
  
  return updatedCharacter;
};

/**
 * Calculate the hit chance in a combat situation
 */
export const calculateHitChance = (attacker: Character, defender: Character): number => {
  // Base hit chance
  let hitChance = 80;
  
  // Adjust based on dexterity/agility difference
  const attackerDex = attacker.stats.dexterity || 0;
  const defenderDex = defender.stats.dexterity || 0;
  const dexDiff = attackerDex - defenderDex;
  
  // Each point of dexterity difference adds 2% hit chance
  hitChance += dexDiff * 2;
  
  // Ensure hit chance is between 10% and 95%
  return Math.min(95, Math.max(10, hitChance));
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
        updatedTarget.health = {
          ...updatedTarget.health,
          current: Math.min(
            updatedTarget.health.max,
            updatedTarget.health.current + effect.value
          )
        };
        break;
      case 'damage':
        updatedTarget.health = {
          ...updatedTarget.health,
          current: Math.max(
            0,
            updatedTarget.health.current - effect.value
          )
        };
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

/**
 * Generate a random number between min and max, inclusive
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};