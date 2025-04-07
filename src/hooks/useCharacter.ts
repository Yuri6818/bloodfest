import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import type { Character } from '../types/game';
import { calculateStatGrowth, calculateMaxHealth, calculateMaxEnergy } from '@utils/gameUtils';
import api from '@utils/api';

export function useCharacter() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCharacter();
    }
  }, [user]);

  const loadCharacter = async () => {
    try {
      const { data } = await api.get<Character>(`/game/character/${user?.id}`);
      setCharacter(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = async (updates: Partial<Character>) => {
    if (!character) return;

    try {
      const { data } = await api.patch<Character>(`/game/character/${character.id}`, updates);
      setCharacter(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character');
      throw err;
    }
  };

  const levelUp = async () => {
    if (!character) return;

    const updatedStats = calculateStatGrowth(
      character.stats,
      character.level + 1,
      character.class
    );

    const updates = {
      level: character.level + 1,
      stats: updatedStats,
      maxHealth: calculateMaxHealth(updatedStats),
      maxEnergy: calculateMaxEnergy(updatedStats)
    };

    await updateCharacter(updates);
  };

  return {
    character,
    loading,
    error,
    updateCharacter,
    levelUp,
    refresh: loadCharacter
  };
}