import { useCharacter } from '@hooks/useCharacter';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Item } from '../../types/game';
import { applyEffects } from '@utils/gameUtils';

const getRarityColor = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common': return 'text-gray-200';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-orange-400';
    default: return 'text-gray-200';
  }
};

const getRarityBorder = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'common': return 'border-gray-500';
    case 'uncommon': return 'border-green-600';
    case 'rare': return 'border-blue-600';
    case 'epic': return 'border-purple-600';
    case 'legendary': return 'border-orange-500';
    default: return 'border-gray-500';
  }
};

const Inventory = () => {
  const { character, loading, error, updateCharacter } = useCharacter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-red-900/50 border-2 border-red-700 p-8 rounded-lg max-w-md w-full shadow-lg">
          <p className="text-2xl text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-8 rounded-lg max-w-md w-full shadow-lg">
          <p className="text-2xl text-red-200 text-center">No character found</p>
          <div className="mt-6 flex justify-center">
            <Link 
              to="/create-character" 
              className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            >
              Create Character
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  const handleUseItem = async () => {
    if (!selectedItem || !character) return;
    
    setActionMessage(null);
    
    // Check if item is usable (consumable)
    if (selectedItem.type !== 'consumable') {
      setActionMessage("This item cannot be used directly.");
      return;
    }
    
    try {
      // Apply item effects
      let updatedCharacter = { ...character };
      
      if (selectedItem.effects && selectedItem.effects.length > 0) {
        // Apply effects like healing
        updatedCharacter = applyEffects(updatedCharacter, selectedItem.effects);
        
        // Remove the used item from inventory
        const updatedInventory = character.inventory.filter(item => item.id !== selectedItem.id);
        updatedCharacter.inventory = updatedInventory;
        
        // Update character
        await updateCharacter(updatedCharacter);
        setActionMessage(`Used ${selectedItem.name} successfully!`);
        
        // Clear selected item if it was consumed
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Error using item:', err);
      setActionMessage('Failed to use item.');
    }
  };
  
  const handleSellItem = async () => {
    if (!selectedItem || !character) return;
    
    try {
      // Calculate sell value (50% of buy value)
      const sellValue = Math.floor(selectedItem.value * 0.5);
      
      // Remove item from inventory and add gold
      const updatedInventory = character.inventory.filter(item => item.id !== selectedItem.id);
      const updatedGold = character.gold + sellValue;
      
      await updateCharacter({
        inventory: updatedInventory,
        gold: updatedGold
      });
      
      setActionMessage(`Sold ${selectedItem.name} for ${sellValue} gold.`);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error selling item:', err);
      setActionMessage('Failed to sell item.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl mb-8">
        <h1 className="text-3xl font-gothic text-red-500 mb-2">{character.name}'s Inventory</h1>
        <p className="text-gray-400">Level {character.level} {character.class}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Grid */}
        <div className="md:col-span-2 bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-gothic text-red-500 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"></path>
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
            </svg>
            Items ({character.inventory.length})
          </h2>

          {character.inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Your inventory is empty
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {character.inventory.map((item) => (
                <div 
                  key={item.id} 
                  className={`cursor-pointer border ${getRarityBorder(item.rarity)} bg-gray-900 bg-opacity-60 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105`}
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full mb-2 flex items-center justify-center">
                      {/* Icon based on item type */}
                      {item.type === 'weapon' && (
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 7H7v6h6V7z" />
                          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.type === 'armor' && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.type === 'consumable' && (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className={`text-center ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Details or Equipment */}
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl">
          {selectedItem ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-gothic ${getRarityColor(selectedItem.rarity)}`}>
                  {selectedItem.name}
                </h2>
                <button 
                  onClick={closeItemDetails}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className={`border ${getRarityBorder(selectedItem.rarity)} rounded-lg p-3 mb-4`}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-gray-200 capitalize">{selectedItem.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Rarity:</span>
                  <span className={getRarityColor(selectedItem.rarity)}>{selectedItem.rarity}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Value:</span>
                  <span className="text-yellow-400">{selectedItem.value} gold</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-gray-300 mb-2">Description:</h3>
                <p className="text-gray-400 italic">{selectedItem.description}</p>
              </div>

              {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-300 mb-2">Stats:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedItem.stats).map(([statName, statValue]) => (
                      <div key={statName} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{statName}:</span>
                        <span className={Number(statValue) > 0 ? 'text-green-400' : 'text-red-400'}>
                          {Number(statValue) > 0 ? `+${statValue}` : statValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionMessage && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-200">{actionMessage}</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button 
                  className={`${
                    selectedItem?.type === 'consumable' 
                      ? 'bg-red-900 hover:bg-red-800' 
                      : 'bg-gray-700 cursor-not-allowed'
                  } text-white font-bold py-2 px-4 rounded-lg`}
                  onClick={handleUseItem}
                  disabled={selectedItem?.type !== 'consumable'}
                >
                  Use
                </button>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                  onClick={handleSellItem}
                >
                  Sell
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-gothic text-red-500 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                Equipment
              </h2>
              
              <div className="space-y-4">
                {Object.entries(character.equipment || {}).map(([slot, item]) => (
                  <div key={slot} className="flex items-center justify-between border-b border-red-900/30 pb-2">
                    <span className="text-gray-300 capitalize">{slot}:</span>
                    {item ? (
                      <button 
                        className={`${getRarityColor(item.rarity)} hover:underline`}
                        onClick={() => handleSelectItem(item)}
                      >
                        {item.name}
                      </button>
                    ) : (
                      <span className="text-gray-500 italic">Empty</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg text-red-400 mb-2">Character Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  {character.stats && Object.entries(character.stats).map(([statName, statValue]) => (
                    <div key={statName} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{statName}:</span>
                      <span className="text-gray-200">{statValue}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-red-900/30 pt-3">
                  <span className="text-gray-400">Gold:</span>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-400 font-bold">{character.gold}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link 
          to="/home" 
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Inventory;
