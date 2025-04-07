import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Character, Enemy, CombatSkill } from '../../types/game';
import LoadingSpinner from '@components/layout/LoadingSpinner';

interface CombatState {
  playerTurn: boolean;
  skills: CombatSkill[];
  enemy: Enemy | null;
  combatLog: string[];
  isLoading: boolean;
  error: string | null;
}

interface CombatResult {
  enemy: Enemy;
  character: Partial<Character>;
  combatLog: string[];
  combatEnded: boolean;
  victory: boolean;
  experienceGained?: number;
  loot?: Enemy['loot'];
}

export default function Combat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [state, setState] = useState<CombatState>({
    playerTurn: true,
    skills: [],
    enemy: null,
    combatLog: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    loadCharacterData();
    initializeCombat();
  }, [user]);

  const loadCharacterData = async () => {
    try {
      const response = await fetch(`/api/characters/${user?.id}`);
      if (!response.ok) throw new Error('Failed to load character data');
      
      const data = await response.json();
      setCharacter(data);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load character',
        isLoading: false
      }));
    }
  };

  const initializeCombat = async () => {
    try {
      const response = await fetch('/api/combat/initialize');
      if (!response.ok) throw new Error('Failed to initialize combat');
      
      const { enemy, availableSkills } = await response.json();
      setState(prev => ({
        ...prev,
        enemy,
        skills: availableSkills,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize combat',
        isLoading: false
      }));
    }
  };

  const useSkill = async (skill: CombatSkill) => {
    if (!state.playerTurn || !character || !state.enemy) return;

    try {
      setState(prev => ({
        ...prev,
        playerTurn: false,
        combatLog: [...prev.combatLog, `${character.name} uses ${skill.name}!`]
      }));

      const response = await fetch('/api/combat/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          skillId: skill.id, 
          characterId: character.id, 
          enemyId: state.enemy.id 
        })
      });
      
      if (!response.ok) throw new Error('Failed to process combat action');
      
      const result = await response.json();
      updateCombatState(result);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Combat action failed',
        playerTurn: true
      }));
    }
  };

  const updateCombatState = (result: CombatResult) => {
    setState(prev => ({
      ...prev,
      enemy: result.enemy,
      playerTurn: true,
      combatLog: [...prev.combatLog, ...result.combatLog],
      error: null
    }));

    setCharacter(prev => prev ? { ...prev, ...result.character } : null);

    if (result.combatEnded) {
      handleCombatEnd(result);
    }
  };

  const handleCombatEnd = async (result: CombatResult) => {
    const endMessage = result.victory ? 'Victory!' : 'Defeat...';
    const experienceMessage = result.experienceGained ? 
      `Experience gained: ${result.experienceGained}` : '';

    setState(prev => ({
      ...prev,
      combatLog: [
        ...prev.combatLog,
        endMessage,
        experienceMessage
      ].filter(Boolean),
      inProgress: false
    }));

    try {
      if (result.victory) {
        await fetch(`/api/characters/${character?.id}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experience: result.experienceGained,
            loot: result.loot
          })
        });
      }

      // If defeated, redirect to home after a short delay
      if (!result.victory) {
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to process combat rewards'
      }));
    }
  };

  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return (
      <div className="text-center">
        <div className="bg-blood/20 border border-blood text-blood-light p-4 rounded mb-4">
          {state.error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Character Status */}
        <div className="bg-dark-lighter p-4 rounded-lg">
          <h2 className="text-xl font-gothic text-blood">{character?.name}</h2>
          <div className="flex flex-col space-y-2">
            <HealthBar current={character?.health || 0} max={character?.maxHealth || 0} />
            <EnergyBar current={character?.energy || 0} max={character?.maxEnergy || 0} />
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-dark-lighter p-4 rounded-lg">
          <h2 className="text-xl font-gothic text-blood">{state.enemy?.name}</h2>
          {state.enemy && (
            <HealthBar current={state.enemy.health} max={state.enemy.maxHealth} />
          )}
        </div>

        {/* Combat Actions */}
        <div className="col-span-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            {state.skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => useSkill(skill)}
                disabled={!state.playerTurn || (character?.energy || 0) < skill.energyCost}
                className="bg-blood hover:bg-blood-dark disabled:bg-gray-600 p-2 rounded"
              >
                {skill.name} ({skill.energyCost} Energy)
              </button>
            ))}
          </div>
        </div>

        {/* Combat Log */}
        <div className="col-span-2 mt-4 bg-dark-lighter p-4 rounded-lg h-48 overflow-y-auto">
          {state.combatLog.map((log, index) => (
            <p key={index} className="text-light">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthBar({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  return (
    <div className="w-full bg-dark-darker rounded-full h-4">
      <div
        className="bg-blood rounded-full h-4 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function EnergyBar({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  return (
    <div className="w-full bg-dark-darker rounded-full h-4">
      <div
        className="bg-accent rounded-full h-4 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}