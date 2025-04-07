import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import type { Item, Character } from '../../types/game';
import LoadingSpinner from '@components/layout/LoadingSpinner';

export default function Inventory() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacterData();
  }, [user]);

  const loadCharacterData = async () => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      const response = await fetch(`/api/characters/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to load character data');
      }
      
      const data = await response.json();
      setCharacter(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character data');
    } finally {
      setIsLoading(false);
    }
  };

  const useItem = async (item: Item) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/inventory/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character?.id,
          itemId: item.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to use item');
      }

      const result = await response.json();
      setCharacter(prev => prev ? { ...prev, ...result.character } : null);
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use item');
    } finally {
      setIsLoading(false);
    }
  };

  const getItemRarityColor = (rarity: Item['rarity']) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity];
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-blood/20 border border-blood text-blood-light p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => loadCharacterData()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center text-blood-light">
        No character data available
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Inventory Grid */}
        <div className="col-span-2">
          <h2 className="text-2xl font-gothic text-blood mb-4">Inventory</h2>
          <div className="grid grid-cols-4 gap-4">
            {character.inventory.map(item => (
              <div
                key={item.id}
                className={`
                  bg-dark-lighter p-4 rounded cursor-pointer transition-all duration-200
                  hover:border-blood-light hover:shadow-lg
                  ${selectedItem?.id === item.id ? 'ring-2 ring-blood' : 'border-2 border-blood/20'}
                `}
                onClick={() => setSelectedItem(item)}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-dark-darker mx-auto mb-2 flex items-center justify-center text-blood-light">
                    {item.type.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className={`text-center ${getItemRarityColor(item.rarity)}`}>
                  {item.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-dark-lighter p-4 rounded">
          {selectedItem ? (
            <div className="space-y-4">
              <h3 className={`text-xl ${getItemRarityColor(selectedItem.rarity)}`}>
                {selectedItem.name}
              </h3>
              <p className="text-light">{selectedItem.description}</p>
              
              {selectedItem.stats && (
                <div className="space-y-2">
                  <h4 className="text-blood">Stats</h4>
                  {Object.entries(selectedItem.stats).map(([stat, value]) => (
                    value ? (
                      <p key={stat} className="text-light">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
                      </p>
                    ) : null
                  ))}
                </div>
              )}

              {selectedItem.type === 'consumable' && (
                <button
                  onClick={() => useItem(selectedItem)}
                  disabled={isLoading}
                  className="w-full bg-blood hover:bg-blood-dark disabled:bg-gray-600 p-2 rounded transition-colors duration-200"
                >
                  {isLoading ? 'Using...' : 'Use Item'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-light text-center">Select an item to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}