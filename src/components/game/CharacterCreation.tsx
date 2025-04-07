import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import type { CharacterStats } from '@types/game';
import LoadingSpinner from '@components/layout/LoadingSpinner';

const STARTING_POINTS = 20;
const MIN_STAT = 5;

interface CharacterForm {
  name: string;
  class: string;
  stats: CharacterStats;
}

export default function CharacterCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CharacterForm>({
    name: '',
    class: 'warrior',
    stats: {
      strength: MIN_STAT,
      agility: MIN_STAT,
      intelligence: MIN_STAT,
      vitality: MIN_STAT
    }
  });

  const [error, setError] = useState<string | null>(null);

  const remainingPoints = STARTING_POINTS - (
    Object.values(form.stats).reduce((sum, stat) => sum + (stat - MIN_STAT), 0)
  );

  const handleStatChange = (stat: keyof CharacterStats, value: number) => {
    const currentValue = form.stats[stat];
    const diff = value - currentValue;
    
    if (diff > 0 && remainingPoints < diff) return;
    if (value < MIN_STAT) return;

    setForm(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingPoints > 0) {
      setError('Please allocate all stat points');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      navigate('/game');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-gothic text-blood mb-6">Create Your Character</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-light mb-2">Character Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-dark-lighter text-light p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-light mb-2">Class</label>
            <select
              value={form.class}
              onChange={e => setForm(prev => ({ ...prev, class: e.target.value }))}
              className="w-full bg-dark-lighter text-light p-2 rounded"
            >
              <option value="warrior">Warrior</option>
              <option value="rogue">Rogue</option>
              <option value="mage">Mage</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-xl text-blood mb-4">
            Stats (Remaining Points: {remainingPoints})
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(form.stats) as Array<keyof CharacterStats>).map(stat => (
              <div key={stat} className="flex items-center justify-between">
                <label className="text-light capitalize">{stat}</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleStatChange(stat, form.stats[stat] - 1)}
                    className="px-2 py-1 bg-blood hover:bg-blood-dark rounded"
                  >
                    -
                  </button>
                  <span className="text-light w-8 text-center">
                    {form.stats[stat]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatChange(stat, form.stats[stat] + 1)}
                    className="px-2 py-1 bg-blood hover:bg-blood-dark rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-blood bg-dark-lighter p-4 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blood hover:bg-blood-dark p-3 rounded text-light"
        >
          Create Character
        </button>
      </form>
    </div>
  );
}