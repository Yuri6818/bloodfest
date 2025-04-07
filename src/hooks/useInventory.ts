import { useState } from 'react';
import type { Character, Item, Equipment } from '../types/game';
import api from '@utils/api';

export function useInventory(character: Character | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const equipItem = async (item: Item) => {
    if (!character) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post<Character>(`/game/character/${character.id}/equip`, {
        itemId: item.id
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to equip item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unequipItem = async (slot: keyof Equipment) => {
    if (!character) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post<Character>(`/game/character/${character.id}/unequip`, {
        slot
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unequip item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const useItem = async (item: Item) => {
    if (!character || item.type !== 'consumable') return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post<Character>(`/game/character/${character.id}/use-item`, {
        itemId: item.id
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const dropItem = async (item: Item) => {
    if (!character) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.post<Character>(`/game/character/${character.id}/drop-item`, {
        itemId: item.id
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drop item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEquippedItems = (): Equipment => {
    if (!character) return {};
    return character.equipment;
  };

  const getInventoryItems = (): Item[] => {
    if (!character) return [];
    return character.inventory;
  };

  return {
    loading,
    error,
    equipItem,
    unequipItem,
    useItem,
    dropItem,
    getEquippedItems,
    getInventoryItems
  };
}