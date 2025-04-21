import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import type { Character, CharacterStats } from '../types/game';
import { calculateStatGrowth, calculateMaxHealth, calculateMaxEnergy } from '@utils/gameUtils';
import api from '@utils/api';
import { getMockCharacter, updateMockCharacter } from '@utils/mockCharacterService';

export function useCharacter() {
  const { user, useMockAuth } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(useMockAuth);

  useEffect(() => {
    // Update mock data flag when auth status changes
    setUseMockData(useMockAuth);
  }, [useMockAuth]);

  useEffect(() => {
    if (user) {
      loadCharacter();
    } else {
      setCharacter(null);
      setLoading(false);
    }
  }, [user, useMockData]);

  const loadCharacter = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (useMockData) {
        console.log('Loading mock character data for user:', user.id);
        // Get character from mock service
        const mockCharacter = getMockCharacter(user.id);
        
        if (mockCharacter) {
          setCharacter(mockCharacter);
          setError(null);
        } else {
          setError('No character found. Please create a character first.');
          setCharacter(null);
        }
      } else {
        try {
          // Try to get from real API
          const { data } = await api.get<Character>(`/game/character/${user.id}`);
          setCharacter(data);
          setError(null);
        } catch (err) {
          console.error('Error loading character from API:', err);
          
          // Try to fall back to mock data
          const mockCharacter = getMockCharacter(user.id);
          
          if (mockCharacter) {
            console.log('Falling back to mock character data');
            setCharacter(mockCharacter);
            setUseMockData(true);
            setError('Using mock character data (backend unavailable)');
          } else {
            setError('Failed to load character. Please create a character first.');
            setCharacter(null);
          }
        }
      }
    } catch (err) {
      console.error('Error in loadCharacter:', err);
      setError(err instanceof Error ? err.message : 'Failed to load character');
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = async (updates: Partial<Character>) => {
    if (!character || !user) return;

    try {
      if (useMockData) {
        // Update in mock service
        const updated = updateMockCharacter(user.id, updates);
        setCharacter(updated);
        setError(null);
        return updated;
      }
      
      try {
        // Try real API
        const { data } = await api.patch<Character>(`/game/character/${character.id}`, updates);
        setCharacter(data);
        setError(null);
        return data;
      } catch (err) {
        console.error('Error updating character via API:', err);
        
        // Fall back to mock data
        setUseMockData(true);
        const updated = updateMockCharacter(user.id, updates);
        setCharacter(updated);
        setError('Using mock character data (backend unavailable)');
        return updated;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character');
      throw err;
    }
  };

  const levelUp = async () => {
    if (!character) return;

    // Create a limited CharacterStats object from the character's stats
    const characterStats: CharacterStats = {
      strength: character.stats.strength,
      agility: character.stats.dexterity,
      intelligence: character.stats.intelligence,
      vitality: character.stats.constitution
    };

    const updatedStats = calculateStatGrowth(
      characterStats,
      character.level + 1,
      character.class
    );

    // Convert stats back to the format expected by the Character interface
    const newStats = {
      ...character.stats,
      strength: updatedStats.strength,
      dexterity: updatedStats.agility,
      constitution: updatedStats.vitality,
      intelligence: updatedStats.intelligence,
      wisdom: updatedStats.intelligence - 2, // Simple calculation for wisdom
      charisma: character.stats.charisma // Keep charisma the same
    };

    const maxHealth = calculateMaxHealth(updatedStats);

    const updates = {
      level: character.level + 1,
      stats: newStats,
      health: {
        current: maxHealth,
        max: maxHealth
      }
    };

    await updateCharacter(updates);
  };

  return {
    character,
    loading,
    error,
    updateCharacter,
    levelUp,
    refresh: loadCharacter,
    useMockData,
    setUseMockData
  };
}