import { useState } from 'react';
import { useCharacter } from '@hooks/useCharacter';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import type { Item } from '@types/game';

// Market items available for purchase
const marketItems: Item[] = [
  {
    id: 'market-item-1',
    name: 'Small Health Potion',
    description: 'Restores 25 health points when consumed',
    type: 'consumable',
    rarity: 'common',
    value: 15,
    effects: [
      {
        type: 'heal',
        value: 25
      }
    ]
  },
  {
    id: 'market-item-2',
    name: 'Medium Health Potion',
    description: 'Restores 50 health points when consumed',
    type: 'consumable',
    rarity: 'uncommon',
    value: 30,
    effects: [
      {
        type: 'heal',
        value: 50
      }
    ]
  },
  {
    id: 'market-item-3',
    name: 'Large Health Potion',
    description: 'Restores 100 health points when consumed',
    type: 'consumable',
    rarity: 'rare',
    value: 60,
    effects: [
      {
        type: 'heal',
        value: 100
      }
    ]
  },
  {
    id: 'market-item-4',
    name: 'Strength Elixir',
    description: 'Temporarily increases strength by 5',
    type: 'consumable',
    rarity: 'rare',
    value: 75,
    effects: [
      {
        type: 'buff',
        value: 5,
        duration: 3
      }
    ]
  },
  {
    id: 'market-item-5',
    name: 'Shadow Cloak',
    description: 'A mysterious cloak that grants stealth in darkness',
    type: 'armor',
    rarity: 'epic',
    value: 120,
    stats: {
      dexterity: 3,
      intelligence: 2
    }
  }
];

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

const Market = () => {
  const { character, loading, error, updateCharacter } = useCharacter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{text: string, isError: boolean} | null>(null);

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
    setPurchaseMessage(null);
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    if (character.gold < selectedItem.value) {
      setPurchaseMessage({
        text: 'Not enough gold to purchase this item!',
        isError: true
      });
      return;
    }

    try {
      // Add item to inventory and deduct gold
      const updatedInventory = [...character.inventory, selectedItem];
      const updatedGold = character.gold - selectedItem.value;
      
      await updateCharacter({
        inventory: updatedInventory,
        gold: updatedGold
      });
      
      setPurchaseMessage({
        text: `Successfully purchased ${selectedItem.name}!`,
        isError: false
      });
    } catch (err) {
      setPurchaseMessage({
        text: 'Failed to purchase item. Please try again.',
        isError: true
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl mb-8">
        <h1 className="text-3xl font-gothic text-red-500 mb-2">Dark Market</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-400">Browse our selection of rare and mysterious items...</p>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-400 font-bold">{character.gold} gold</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="md:col-span-2 bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-gothic text-red-500 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Available Items
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {marketItems.map((item) => (
              <div 
                key={item.id} 
                className={`cursor-pointer border ${getRarityBorder(item.rarity)} bg-gray-900 bg-opacity-60 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105 ${selectedItem?.id === item.id ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="flex justify-between mb-2">
                  <h3 className={`${getRarityColor(item.rarity)} font-semibold`}>{item.name}</h3>
                  <span className="text-yellow-400">{item.value} gold</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{item.type}</span>
                  <span className={getRarityColor(item.rarity)}>{item.rarity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-black bg-opacity-80 border-2 border-red-900 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-gothic text-red-500 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Item Details
          </h2>

          {purchaseMessage && (
            <div className={`mb-4 p-3 rounded-lg ${purchaseMessage.isError ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
              <p className={purchaseMessage.isError ? 'text-red-200' : 'text-green-200'}>
                {purchaseMessage.text}
              </p>
            </div>
          )}

          {selectedItem ? (
            <div>
              <div className={`border ${getRarityBorder(selectedItem.rarity)} rounded-lg p-3 mb-4`}>
                <h3 className={`text-xl ${getRarityColor(selectedItem.rarity)} mb-2`}>{selectedItem.name}</h3>
                <p className="text-gray-400 italic mb-4">{selectedItem.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-gray-200 capitalize">{selectedItem.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rarity:</span>
                    <span className={getRarityColor(selectedItem.rarity)}>{selectedItem.rarity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-yellow-400">{selectedItem.value} gold</span>
                  </div>
                </div>

                {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-gray-300 mb-1">Stats:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedItem.stats).map(([statName, statValue]) => (
                        <div key={statName} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{statName}:</span>
                          <span className="text-green-400">+{statValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.effects && selectedItem.effects.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-gray-300 mb-1">Effects:</h4>
                    <div className="space-y-2">
                      {selectedItem.effects.map((effect, index) => (
                        <div key={index} className="text-gray-400">
                          {effect.type === 'heal' ? (
                            <span>Restores <span className="text-green-400">{effect.value}</span> health</span>
                          ) : effect.type === 'buff' ? (
                            <span>Increases stats by <span className="text-blue-400">{effect.value}</span> {effect.duration ? `for ${effect.duration} turns` : ''}</span>
                          ) : (
                            <span>{effect.type}: {effect.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className={`w-full py-2 px-4 rounded-lg font-semibold ${
                    character.gold >= selectedItem.value
                      ? 'bg-green-800 hover:bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handlePurchase}
                  disabled={character.gold < selectedItem.value}
                >
                  {character.gold >= selectedItem.value ? 'Purchase' : 'Not enough gold'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Select an item to view details</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg text-red-400 mb-2">Your Gold</h3>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-300">Available:</span>
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

export default Market; 