import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from './AuthContext';
import { createMockCharacter } from '../utils/mockCharacterService';

// Types
export interface CharacterClass {
  id: string;
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
}

export interface CharacterData {
  name: string;
  characterClass: string;
  appearance: {
    hairStyle: string;
    hairColor: string;
    facialFeatures: string;
    skinTone: string;
    markings: string;
  };
  background: string;
}

interface CharacterContextType {
  classes: CharacterClass[];
  isLoading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  createCharacter: (characterData: CharacterData) => Promise<void>;
  clearError: () => void;
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
}

// Mock data for development
const mockCharacterClasses: CharacterClass[] = [
  {
    id: 'vampire',
    name: 'Vampire',
    description: 'Masters of the night who feed on blood to fuel their dark powers. Vampires possess supernatural strength, agility, and charm that makes them deadly predators.',
    baseStats: {
      health: 100,
      strength: 15,
      dexterity: 12,
      intelligence: 10,
      willpower: 8
    },
    specialResource: {
      name: 'Blood Pool',
      description: 'Store blood from victims to fuel vampire abilities',
      maxValue: 100
    },
    startingAbilities: [
      'Blood Drain - Restore health by drinking blood from enemies',
      'Night Vision - See clearly in darkness',
      'Charm - Temporarily control a weak-minded victim'
    ]
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    description: 'Primal shapeshifters who harness the raw power of the beast within. Werewolves excel at vicious melee combat and tracking prey across vast distances.',
    baseStats: {
      health: 120,
      strength: 18,
      dexterity: 14,
      intelligence: 6,
      willpower: 7
    },
    specialResource: {
      name: 'Rage',
      description: 'Build rage in combat to unleash devastating attacks',
      maxValue: 100
    },
    startingAbilities: [
      'Transform - Switch between human and werewolf forms',
      'Rend - Tear enemies apart with claws',
      'Scent of Blood - Track wounded enemies across long distances'
    ]
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'Dark magic practitioners who command the dead and drain life essence. Necromancers control undead minions while weakening enemies from afar.',
    baseStats: {
      health: 80,
      strength: 5,
      dexterity: 8,
      intelligence: 18,
      willpower: 14
    },
    specialResource: {
      name: 'Soul Essence',
      description: 'Harvest souls to power necromantic spells',
      maxValue: 100
    },
    startingAbilities: [
      'Raise Dead - Resurrect fallen enemies as temporary servants',
      'Soul Drain - Steal life force from enemies',
      'Death Vision - See supernatural auras and hidden undead'
    ]
  },
  {
    id: 'demon',
    name: 'Demon Hunter',
    description: 'Mortals who have infused themselves with demonic essence to fight fire with fire. They employ a blend of forbidden magic and specialized weaponry.',
    baseStats: {
      health: 90,
      strength: 12,
      dexterity: 15,
      intelligence: 12,
      willpower: 10
    },
    specialResource: {
      name: 'Infernal Power',
      description: 'Balance human control with demonic power',
      maxValue: 100
    },
    startingAbilities: [
      'Hellfire - Engulf weapons in demonic flame',
      'Shadow Step - Short-range teleportation',
      'Demonic Sight - See through illusions and detect supernatural entities'
    ]
  }
];

const CharacterContext = createContext<CharacterContextType | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Default to using mock data since the backend is unreliable
  const [useMockData, setUseMockData] = useState(true);
  
  const { user } = useAuth();

  // Initial load - provide mock data right away
  useEffect(() => {
    // Load mock data right away on mount
    setClasses(mockCharacterClasses);
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (useMockData) {
        // Use mock data instead of API call
        console.log('Using mock character classes data');
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        setClasses(mockCharacterClasses);
      } else {
        // Attempt to fetch from API
        console.log('Fetching character classes from API');
        try {
          const response = await axios.get('/api/character/classes');
          setClasses(response.data.classes);
        } catch (err) {
          console.error('Error fetching character classes:', err);
          
          // Automatically switch to mock data on any API error
          console.log('API error, switching to mock data');
          setUseMockData(true);
          setClasses(mockCharacterClasses);
          
          // Set an appropriate error message
          if (err instanceof AxiosError) {
            if (err.response?.status === 500) {
              setError('Backend server error. Using mock data instead.');
            } else if (!err.response) {
              setError('Backend server is unavailable. Using mock data instead.');
            } else {
              setError('Error loading character classes. Using mock data instead.');
            }
          } else {
            setError('An unexpected error occurred. Using mock data instead.');
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchClasses:', err);
      // Set mock data as fallback for any error
      setClasses(mockCharacterClasses);
      setUseMockData(true);
      setError('An unexpected error occurred. Using mock data instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const createCharacter = async (characterData: CharacterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (useMockData) {
        // Create a mock character using the mock service
        console.log('Creating mock character:', characterData);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        if (user?.id) {
          // Create the mock character with our mock service
          createMockCharacter(
            user.id,
            characterData.name,
            characterData.characterClass
          );
          console.log('Mock character created successfully!');
        } else {
          console.error('Cannot create character: No user ID available');
          setError('User not authenticated. Please log in again.');
          throw new Error('User not authenticated');
        }
        return;
      } 
      
      try {
        // Actual API call
        await axios.post('/api/character/create', characterData);
      } catch (err) {
        console.error('Error creating character:', err);
        
        // Automatically switch to mock for API errors
        setUseMockData(true);
        
        if (err instanceof AxiosError) {
          if (err.response?.status === 500) {
            // Create a mock character instead
            if (user?.id) {
              createMockCharacter(
                user.id,
                characterData.name,
                characterData.characterClass
              );
              setError('Backend server error. Character was created using mock data.');
              return; // Return success even though API failed
            }
          } else if (!err.response) {
            // Create a mock character instead
            if (user?.id) {
              createMockCharacter(
                user.id,
                characterData.name,
                characterData.characterClass
              );
              setError('Backend server is unavailable. Character was created using mock data.');
              return; // Return success even though API failed
            }
          } else {
            setError(err.response.data?.message || 'Failed to create character');
          }
        } else {
          setError('An unexpected error occurred');
        }
        throw err;
      }
    } catch (err) {
      console.error('Error in createCharacter:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <CharacterContext.Provider value={{
      classes,
      isLoading,
      error,
      fetchClasses,
      createCharacter,
      clearError,
      useMockData,
      setUseMockData
    }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
} 