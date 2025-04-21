// Define Enemy type locally
export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  experience: number;
}

export class GameLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameLogicError';
  }
}

export const generateEnemyStats = (level: number): Enemy => {
  if (level < 1) throw new GameLogicError('Enemy level must be at least 1');

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

export const calculateExperience = (level: number): number => {
  if (level < 1) throw new GameLogicError('Level must be at least 1');
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const generateEnemyName = (level: number): string => {
  const prefixes = ['Fierce', 'Dark', 'Cursed', 'Ancient', 'Corrupted'];
  const types = ['Warrior', 'Beast', 'Demon', 'Specter', 'Dragon'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return `${prefix} ${type}`;
};