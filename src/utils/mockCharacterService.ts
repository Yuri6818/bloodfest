import type { Character, CharacterClass, Item } from '../types/game';

// Mock inventory items
const mockItems: Item[] = [
  {
    id: 'item-1',
    name: 'Rusty Dagger',
    description: 'A simple but effective weapon for a novice adventurer',
    type: 'weapon',
    rarity: 'common',
    stats: {
      strength: 3
    },
    value: 10
  },
  {
    id: 'item-2',
    name: 'Leather Vest',
    description: 'Basic protection against weak enemies',
    type: 'armor',
    rarity: 'common',
    stats: {
      vitality: 2
    },
    value: 15
  },
  {
    id: 'item-3',
    name: 'Health Potion',
    description: 'Restores 50 health when consumed',
    type: 'consumable',
    rarity: 'common',
    effects: [
      {
        type: 'heal',
        value: 50
      }
    ],
    value: 5
  }
];

// Generate base stats based on character class
const getBaseStats = (characterClass: CharacterClass) => {
  switch (characterClass) {
    case 'warrior':
      return {
        strength: 10,
        agility: 6,
        intelligence: 4,
        vitality: 10
      };
    case 'rogue':
      return {
        strength: 6,
        agility: 12,
        intelligence: 6,
        vitality: 6
      };
    case 'mage':
      return {
        strength: 3,
        agility: 5,
        intelligence: 12,
        vitality: 5
      };
    default:
      return {
        strength: 6,
        agility: 6,
        intelligence: 6,
        vitality: 6
      };
  }
};

// Generate a character based on the user ID and selected class
export const generateMockCharacter = (
  userId: string, 
  name: string, 
  characterClass: string
): Character => {
  // Map the character class to the allowed types
  const typedClass: CharacterClass = 
    characterClass === 'vampire' || characterClass === 'werewolf' 
      ? 'warrior' 
      : characterClass === 'necromancer' 
        ? 'mage' 
        : 'rogue';
  
  const stats = getBaseStats(typedClass);
  
  // Convert the stats to match the Character interface
  const characterStats = {
    strength: stats.strength,
    dexterity: stats.agility,
    constitution: stats.vitality,
    intelligence: stats.intelligence,
    wisdom: stats.intelligence - 2,
    charisma: 5
  };
  
  return {
    id: `char-${Date.now()}`,
    name,
    class: typedClass,
    level: 1,
    experience: 0,
    health: {
      current: 100,
      max: 100
    },
    stats: characterStats,
    inventory: [...mockItems],
    equipment: {
      weapon: mockItems[0],
      armor: mockItems[1]
    },
    skills: [
      {
        id: 'skill-1',
        name: typedClass === 'warrior' 
          ? 'Slash' 
          : typedClass === 'rogue' 
            ? 'Backstab' 
            : 'Fireball',
        level: 1,
        description: 'A basic attack',
      }
    ],
    gold: 1000,
    quests: {
      active: [],
      completed: []
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
};

// Mock character storage
const mockCharacters: Record<string, Character> = {};

// Create a mock character and store it
export const createMockCharacter = (
  userId: string,
  name: string,
  characterClass: string
): Character => {
  const character = generateMockCharacter(userId, name, characterClass);
  mockCharacters[userId] = character;
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem('mockCharacters', JSON.stringify(mockCharacters));
  } catch (err) {
    console.error('Error storing mock characters:', err);
  }
  
  return character;
};

// Get a mock character by user ID
export const getMockCharacter = (userId: string): Character | null => {
  // Try to load from localStorage first
  try {
    const storedCharacters = localStorage.getItem('mockCharacters');
    if (storedCharacters) {
      const parsed = JSON.parse(storedCharacters);
      if (parsed[userId]) {
        return parsed[userId];
      }
    }
  } catch (err) {
    console.error('Error loading mock characters:', err);
  }
  
  // Return from memory if available
  return mockCharacters[userId] || null;
};

// Update a mock character
export const updateMockCharacter = (
  userId: string,
  updates: Partial<Character>
): Character => {
  const existing = getMockCharacter(userId);
  if (!existing) {
    throw new Error('Character not found');
  }
  
  const updated = { ...existing, ...updates };
  mockCharacters[userId] = updated;
  
  // Update localStorage
  try {
    localStorage.setItem('mockCharacters', JSON.stringify(mockCharacters));
  } catch (err) {
    console.error('Error storing mock characters:', err);
  }
  
  return updated;
}; 