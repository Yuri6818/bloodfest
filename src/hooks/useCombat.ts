import { useState } from 'react';
import { useCharacter } from './useCharacter';
import type { Character, Enemy, CombatSkill, Item } from '../types/game';
import { 
  getRandomEnemy, 
  calculateDamage, 
  calculateHitChance, 
  generateLoot,
  processCombatAction,
  processFlee
} from '../utils/mockCombatService';

interface CombatState {
  inProgress: boolean;
  playerTurn: boolean;
  enemy: Enemy | null;
  combatLog: string[];
  rewards: {
    experience: number;
    loot: Item[];
  } | null;
}

export function useCombat() {
  const { character, updateCharacter } = useCharacter();
  const [state, setState] = useState<CombatState>({
    inProgress: false,
    playerTurn: true,
    enemy: null,
    combatLog: [],
    rewards: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCombat = async (enemyLevel?: number) => {
    if (!character) {
      setError('No character found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get level-appropriate enemy or use character level if none specified
      const targetLevel = enemyLevel || character.level;
      const enemy = getRandomEnemy(targetLevel);
      
      setState({
        inProgress: true,
        playerTurn: true,
        enemy,
        combatLog: [`Combat started against ${enemy.name}!`],
        rewards: null
      });
    } catch (error) {
      console.error('Combat initialization failed:', error);
      setError('Failed to start combat');
    } finally {
      setLoading(false);
    }
  };

  const useSkill = async (skillId: string) => {
    if (!character || !state.enemy || !state.playerTurn) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = processCombatAction(
        character, 
        state.enemy, 
        skillId
      );
      
      // Update character with changes (like health)
      await updateCharacter(result.updatedCharacter);
      
      if (result.isCombatOver) {
        if (result.victory) {
          // Combat is over with victory
          setState(prev => ({
            ...prev,
            inProgress: false,
            enemy: result.updatedEnemy,
            combatLog: [...prev.combatLog, ...result.combatLog],
            rewards: {
              experience: state.enemy.experience || 0,
              loot: generateLoot(state.enemy) || []
            }
          }));
        } else {
          // Combat is over with defeat
          setState(prev => ({
            ...prev,
            inProgress: false,
            enemy: result.updatedEnemy,
            combatLog: [...prev.combatLog, ...result.combatLog],
            rewards: null
          }));
        }
      } else {
        // Combat continues
        setState(prev => ({
          ...prev,
          enemy: result.updatedEnemy,
          playerTurn: true, // Always player's turn after a full round in this model
          combatLog: [...prev.combatLog, ...result.combatLog]
        }));
      }
    } catch (error) {
      console.error('Error in combat:', error);
      setError('An error occurred during combat');
    } finally {
      setLoading(false);
    }
  };

  const flee = async () => {
    if (!character || !state.inProgress) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fleeResult = processFlee(character);
      
      if (fleeResult.success) {
        setState(prev => ({
          ...prev,
          inProgress: false,
          combatLog: [...prev.combatLog, fleeResult.log],
          rewards: null
        }));
      } else {
        // Failed to flee, enemy gets a turn
        setState(prev => ({
          ...prev,
          playerTurn: false,
          combatLog: [...prev.combatLog, fleeResult.log]
        }));
        
        // Process enemy turn automatically after failing to flee
        if (state.enemy) {
          const result = processCombatAction(
            character,
            state.enemy,
            'enemy-attack' // A dummy skill ID for the enemy
          );
          
          // Update character with changes
          await updateCharacter(result.updatedCharacter);
          
          if (result.isCombatOver) {
            // Character was defeated
            setState(prev => ({
              ...prev,
              inProgress: false,
              enemy: result.updatedEnemy,
              combatLog: [...prev.combatLog, ...result.combatLog],
              rewards: null
            }));
          } else {
            // Combat continues
            setState(prev => ({
              ...prev,
              enemy: result.updatedEnemy,
              playerTurn: true,
              combatLog: [...prev.combatLog, ...result.combatLog]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fleeing from combat:', error);
      setError('An error occurred while trying to flee');
    } finally {
      setLoading(false);
    }
  };

  const resetCombat = () => {
    setState({
      inProgress: false,
      playerTurn: true,
      enemy: null,
      combatLog: [],
      rewards: null
    });
  };

  return {
    ...state,
    loading,
    error,
    character,
    initiateCombat,
    useSkill,
    flee,
    resetCombat
  };
} 