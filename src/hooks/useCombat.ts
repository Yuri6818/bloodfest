import { useState } from 'react';
import type { Character, Enemy, CombatSkill } from '../types/game';
import { calculateDamage, calculateHitChance, generateLoot } from '@utils/gameUtils';
import api from '@utils/api';

interface CombatState {
  inProgress: boolean;
  playerTurn: boolean;
  enemy: Enemy | null;
  combatLog: string[];
}

export function useCombat(character: Character | null) {
  const [state, setState] = useState<CombatState>({
    inProgress: false,
    playerTurn: true,
    enemy: null,
    combatLog: []
  });

  const initiateCombat = async (enemyLevel: number) => {
    try {
      const { data: enemy } = await api.get<Enemy>(`/combat/initialize/${enemyLevel}`);
      setState({
        inProgress: true,
        playerTurn: true,
        enemy,
        combatLog: [`Combat started against ${enemy.name}!`]
      });
    } catch (error) {
      console.error('Combat initialization failed:', error);
    }
  };

  const useSkill = async (skill: CombatSkill) => {
    if (!character || !state.enemy || !state.playerTurn) return;

    const hitChance = calculateHitChance(character, state.enemy);
    const hit = Math.random() * 100 <= hitChance;

    if (!hit) {
      setState(prev => ({
        ...prev,
        playerTurn: false,
        combatLog: [...prev.combatLog, `${character.name}'s ${skill.name} missed!`]
      }));
      return;
    }

    const damage = calculateDamage(character, state.enemy, skill.damage || 0, skill.effects);
    const updatedEnemy = {
      ...state.enemy,
      health: Math.max(0, state.enemy.health - damage)
    };

    const log = [`${character.name} uses ${skill.name} for ${damage} damage!`];

    if (updatedEnemy.health <= 0) {
      const generatedLoot = generateLoot(state.enemy);
      log.push(`${state.enemy.name} has been defeated!`);
      if (generatedLoot && generatedLoot.length > 0) {
        log.push('You found:', ...generatedLoot.map(item => `- ${item.name}`));
      }

      setState(prev => ({
        ...prev,
        inProgress: false,
        enemy: null,
        combatLog: [...prev.combatLog, ...log]
      }));

      // Handle victory and rewards
      await handleVictory(state.enemy);
      return;
    }

    setState(prev => ({
      ...prev,
      enemy: updatedEnemy,
      playerTurn: false,
      combatLog: [...prev.combatLog, ...log]
    }));

    // Enemy turn
    setTimeout(() => enemyTurn(), 1000);
  };

  const enemyTurn = async () => {
    if (!character || !state.enemy) return;

    const hitChance = calculateHitChance(state.enemy, character);
    const hit = Math.random() * 100 <= hitChance;

    if (!hit) {
      setState(prev => ({
        ...prev,
        playerTurn: true,
        combatLog: [...prev.combatLog, `${state.enemy?.name}'s attack missed!`]
      }));
      return;
    }

    const damage = calculateDamage(state.enemy, character, state.enemy.damage);
    const log = [`${state.enemy.name} attacks for ${damage} damage!`];

    try {
      const { data: updatedCharacter } = await api.post<Character>(
        `/game/combat/damage/${character.id}`,
        { damage }
      );

      if (updatedCharacter.health <= 0) {
        log.push('You have been defeated!');
        setState(prev => ({
          ...prev,
          inProgress: false,
          combatLog: [...prev.combatLog, ...log]
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        playerTurn: true,
        combatLog: [...prev.combatLog, ...log]
      }));
    } catch (error) {
      console.error('Failed to process enemy turn:', error);
    }
  };

  const handleVictory = async (enemy: Enemy) => {
    try {
      await api.post(`/game/combat/reward/${character?.id}`, {
        experience: enemy.experience,
        loot: enemy.loot
      });
    } catch (error) {
      console.error('Failed to process rewards:', error);
    }
  };

  const flee = async () => {
    if (!state.inProgress) return;

    const fleeChance = 50; // Base flee chance
    const success = Math.random() * 100 <= fleeChance;

    if (success) {
      setState(prev => ({
        ...prev,
        inProgress: false,
        enemy: null,
        combatLog: [...prev.combatLog, 'You successfully fled from combat!']
      }));
    } else {
      setState(prev => ({
        ...prev,
        playerTurn: false,
        combatLog: [...prev.combatLog, 'Failed to flee!']
      }));
      setTimeout(() => enemyTurn(), 1000);
    }
  };

  return {
    ...state,
    initiateCombat,
    useSkill,
    flee
  };
}