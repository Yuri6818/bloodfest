import type { Character, Enemy, CombatSkill, Item, ItemEffect } from '../types/game';

// Mock enemies at different levels
export const mockEnemies: Enemy[] = [
  {
    id: 'enemy-1',
    name: 'Feral Ghoul',
    level: 1,
    health: 50,
    maxHealth: 50,
    damage: 5,
    defense: 2,
    experience: 20,
    loot: [
      {
        id: 'item-5',
        name: 'Ghoul Teeth',
        description: 'Sharp teeth from a ghoul, used in crafting dark artifacts',
        type: 'material',
        rarity: 'common',
        value: 3
      }
    ]
  },
  {
    id: 'enemy-2',
    name: 'Blood Cultist',
    level: 2,
    health: 70,
    maxHealth: 70,
    damage: 8,
    defense: 3,
    experience: 35,
    loot: [
      {
        id: 'item-6',
        name: 'Cultist Robe',
        description: 'Dark robes worn by blood cultists',
        type: 'armor',
        rarity: 'uncommon',
        stats: {
          intelligence: 2
        },
        value: 12
      }
    ]
  },
  {
    id: 'enemy-3',
    name: 'Rabid Werewolf',
    level: 3,
    health: 120,
    maxHealth: 120,
    damage: 12,
    defense: 5,
    experience: 60,
    loot: [
      {
        id: 'item-7',
        name: 'Werewolf Claw',
        description: 'A razor-sharp claw from a werewolf',
        type: 'weapon',
        rarity: 'rare',
        stats: {
          strength: 5,
          dexterity: 2
        },
        value: 45
      }
    ]
  },
  {
    id: 'enemy-4',
    name: 'Ancient Vampire',
    level: 5,
    health: 200,
    maxHealth: 200,
    damage: 18,
    defense: 8,
    experience: 120,
    loot: [
      {
        id: 'item-8',
        name: 'Vampiric Amulet',
        description: 'An amulet that grants life-stealing abilities',
        type: 'armor',
        rarity: 'epic',
        stats: {
          strength: 3,
          intelligence: 5
        },
        effects: [
          {
            type: 'lifesteal',
            value: 10,
            duration: 0
          }
        ],
        value: 120
      }
    ]
  }
];

// Calculate damage function
export const calculateDamage = (
  attacker: Character | Enemy, 
  defender: Character | Enemy,
  baseDamage: number,
  effects?: ItemEffect[]
): number => {
  // Get strength from attacker if it's a character
  const attackPower = 'stats' in attacker ? attacker.stats.strength || 0 : attacker.damage;
  
  // Get defense from defender if it's a character
  const defensePower = 'stats' in defender ? defender.stats.constitution || 0 : defender.defense;
  
  // Calculate base damage
  let damage = baseDamage + attackPower - (defensePower / 2);
  
  // Ensure minimum damage
  damage = Math.max(1, Math.round(damage));
  
  // Apply random variation (80% to 120%)
  damage = Math.round(damage * (0.8 + Math.random() * 0.4));
  
  return damage;
};

// Calculate hit chance
export const calculateHitChance = (attacker: Character | Enemy, defender: Character | Enemy): number => {
  // Base hit chance
  let hitChance = 80;
  
  // If character, add bonus from dexterity or agility
  if ('stats' in attacker) {
    hitChance += (attacker.stats.dexterity || 0) * 2;
  }
  
  // If defender is character, add evasion from dexterity or agility
  if ('stats' in defender) {
    hitChance -= (defender.stats.dexterity || 0);
  }
  
  // Ensure hit chance is between 10% and 95%
  return Math.min(95, Math.max(10, hitChance));
};

// Generate a random enemy appropriate for the character's level
export const getRandomEnemy = (characterLevel: number): Enemy => {
  // Filter enemies within an appropriate level range
  const levelRange = 2; // Enemies within 2 levels of character
  const eligibleEnemies = mockEnemies.filter(
    enemy => Math.abs(enemy.level - characterLevel) <= levelRange
  );
  
  // If no enemies in range, return the first enemy
  if (eligibleEnemies.length === 0) {
    return {...mockEnemies[0]}; // Return a copy to avoid mutation
  }
  
  // Get a random enemy from eligible ones
  const randomIndex = Math.floor(Math.random() * eligibleEnemies.length);
  
  // Return a deep copy to avoid mutations
  return JSON.parse(JSON.stringify(eligibleEnemies[randomIndex]));
};

// Generate loot from defeated enemy
export const generateLoot = (enemy: Enemy): Item[] => {
  if (!enemy.loot || enemy.loot.length === 0) {
    return [];
  }
  
  // Decide if enemy drops loot (70% chance)
  const dropsLoot = Math.random() < 0.7;
  
  if (!dropsLoot) {
    return [];
  }
  
  // For each loot item, decide if it drops (50% chance per item)
  return enemy.loot.filter(() => Math.random() < 0.5);
};

// Handle combat logic
export const processCombatAction = (
  character: Character,
  enemy: Enemy,
  skillId: string
): {
  updatedCharacter: Character,
  updatedEnemy: Enemy,
  combatLog: string[],
  isCombatOver: boolean,
  victory: boolean
} => {
  // Find the skill by ID
  const skill = character.skills.find(s => s.id === skillId);
  
  if (!skill) {
    return {
      updatedCharacter: character,
      updatedEnemy: enemy,
      combatLog: ['Skill not found!'],
      isCombatOver: false,
      victory: false
    };
  }
  
  const combatLog: string[] = [];
  
  // Player attack
  const hitChance = calculateHitChance(character, enemy);
  const hit = Math.random() * 100 <= hitChance;
  
  if (!hit) {
    combatLog.push(`${character.name}'s ${skill.name} missed!`);
  } else {
    // For simplicity, assume a damage value of 10 if not present
    const baseDamage = 10;
    const damage = calculateDamage(character, enemy, baseDamage);
    
    combatLog.push(`${character.name} uses ${skill.name} for ${damage} damage!`);
    
    // Update enemy health
    enemy = {
      ...enemy,
      health: Math.max(0, enemy.health - damage)
    };
    
    // Check if enemy is defeated
    if (enemy.health <= 0) {
      combatLog.push(`${enemy.name} has been defeated!`);
      
      // Get loot
      const loot = generateLoot(enemy);
      
      if (loot.length > 0) {
        combatLog.push('You found:');
        loot.forEach(item => {
          combatLog.push(`- ${item.name}`);
        });
        
        // Add loot to character inventory
        character = {
          ...character,
          inventory: [...character.inventory, ...loot],
          experience: character.experience + enemy.experience
        };
      } else {
        combatLog.push('No loot was found.');
        character = {
          ...character,
          experience: character.experience + enemy.experience
        };
      }
      
      return {
        updatedCharacter: character,
        updatedEnemy: enemy,
        combatLog,
        isCombatOver: true,
        victory: true
      };
    }
  }
  
  // Enemy attack if still alive
  const enemyHitChance = calculateHitChance(enemy, character);
  const enemyHit = Math.random() * 100 <= enemyHitChance;
  
  if (!enemyHit) {
    combatLog.push(`${enemy.name}'s attack missed!`);
  } else {
    const enemyDamage = calculateDamage(enemy, character, enemy.damage);
    
    combatLog.push(`${enemy.name} attacks for ${enemyDamage} damage!`);
    
    // Update character health
    const currentHealth = character.health.current - enemyDamage;
    character = {
      ...character,
      health: {
        ...character.health,
        current: Math.max(0, currentHealth)
      }
    };
    
    // Check if character is defeated
    if (character.health.current <= 0) {
      combatLog.push(`${character.name} has been defeated!`);
      
      return {
        updatedCharacter: character,
        updatedEnemy: enemy,
        combatLog,
        isCombatOver: true,
        victory: false
      };
    }
  }
  
  return {
    updatedCharacter: character,
    updatedEnemy: enemy,
    combatLog,
    isCombatOver: false,
    victory: false
  };
};

// Process attempt to flee combat
export const processFlee = (character: Character): { success: boolean, log: string } => {
  // 50% base chance to flee, increased by dexterity or agility
  const dexterityBonus = character.stats.dexterity || 0;
  const fleeChance = 50 + dexterityBonus * 2;
  
  const fleeRoll = Math.random() * 100;
  const success = fleeRoll <= fleeChance;
  
  return {
    success,
    log: success ? 'You successfully fled from combat!' : 'Failed to flee from combat!'
  };
}; 