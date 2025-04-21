import { useState } from 'react';
import { useCombat } from '@hooks/useCombat';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import { Link } from 'react-router-dom';

const Combat = () => {
  const { 
    character, 
    enemy, 
    inProgress, 
    playerTurn, 
    combatLog, 
    rewards,
    loading, 
    error,
    initiateCombat, 
    useSkill, 
    flee, 
    resetCombat 
  } = useCombat();
  
  const [enemyLevel, setEnemyLevel] = useState<number>(1);

  if (loading) return <LoadingSpinner />;
  
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

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-red-900/50 border-2 border-red-700 p-8 rounded-lg max-w-md w-full shadow-lg">
          <p className="text-2xl text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  const startCombat = () => {
    initiateCombat(enemyLevel);
  };

  const renderCombatControls = () => (
    <div className="flex flex-col gap-4">
      {!inProgress ? (
        <div className="p-4 bg-black/60 border border-red-900/30 rounded-lg">
          <h3 className="text-red-400 text-lg mb-4">Start a New Battle</h3>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Enemy Level</label>
            <div className="flex items-center">
              <button 
                className="bg-red-900/50 px-3 py-1 rounded-l"
                onClick={() => setEnemyLevel(Math.max(1, enemyLevel - 1))}
              >
                -
              </button>
              <span className="bg-black px-4 py-1">{enemyLevel}</span>
              <button 
                className="bg-red-900/50 px-3 py-1 rounded-r"
                onClick={() => setEnemyLevel(enemyLevel + 1)}
              >
                +
              </button>
            </div>
          </div>
          <button 
            className="w-full bg-red-900 hover:bg-red-800 text-white py-2 rounded-lg"
            onClick={startCombat}
          >
            Start Combat
          </button>
        </div>
      ) : (
        <div className="p-4 bg-black/60 border border-red-900/30 rounded-lg">
          <h3 className="text-red-400 text-lg mb-4">Combat Actions</h3>
          <div className="space-y-2">
            {character.skills.map((skill) => (
              <button
                key={skill.id}
                className="w-full bg-red-900/70 hover:bg-red-900 text-white py-2 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => useSkill(skill.id)}
                disabled={!playerTurn}
              >
                {skill.name}
              </button>
            ))}
            <button
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={flee}
              disabled={!playerTurn}
            >
              Flee
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCombatLog = () => (
    <div className="bg-black/60 border border-red-900/30 rounded-lg p-4 h-64 overflow-y-auto">
      <h3 className="text-red-400 text-lg mb-2">Combat Log</h3>
      <div className="space-y-1 text-sm">
        {combatLog.length === 0 ? (
          <p className="text-gray-500 italic">Combat log will appear here...</p>
        ) : (
          combatLog.map((entry, index) => (
            <p key={index} className="text-gray-300">{entry}</p>
          ))
        )}
      </div>
    </div>
  );

  const renderEnemyInfo = () => {
    if (!enemy) {
      return (
        <div className="bg-black/60 border border-red-900/30 rounded-lg p-4">
          <p className="text-gray-500 italic text-center">No enemy present</p>
        </div>
      );
    }

    const healthPercentage = (enemy.health / enemy.maxHealth) * 100;
    
    return (
      <div className="bg-black/60 border border-red-900/30 rounded-lg p-4">
        <h3 className="text-red-400 text-xl">{enemy.name}</h3>
        <p className="text-gray-400 mb-2">Level {enemy.level}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Health</span>
            <span className="text-gray-300">{enemy.health} / {enemy.maxHealth}</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2.5">
            <div 
              className="bg-red-700 h-2.5 rounded-full" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Damage</span>
            <span className="text-gray-300">{enemy.damage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Defense</span>
            <span className="text-gray-300">{enemy.defense}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerInfo = () => {
    if (!character) return null;

    const healthPercentage = (character.health.current / character.health.max) * 100;
    
    return (
      <div className="bg-black/60 border border-red-900/30 rounded-lg p-4">
        <h3 className="text-red-400 text-xl">{character.name}</h3>
        <p className="text-gray-400 mb-2">Level {character.level} {character.class}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Health</span>
            <span className="text-gray-300">{character.health.current} / {character.health.max}</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2.5">
            <div 
              className="bg-red-700 h-2.5 rounded-full" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Strength</span>
            <span className="text-gray-300">{character.stats.strength}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dexterity</span>
            <span className="text-gray-300">{character.stats.dexterity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Constitution</span>
            <span className="text-gray-300">{character.stats.constitution}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Intelligence</span>
            <span className="text-gray-300">{character.stats.intelligence}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRewards = () => {
    if (!rewards) return null;
    
    return (
      <div className="bg-black/60 border-2 border-green-700/50 rounded-lg p-4 mt-4">
        <h3 className="text-green-400 text-lg mb-2">Victory Rewards</h3>
        <p className="text-gray-300 mb-2">
          Experience: <span className="text-yellow-400">{rewards.experience}</span>
        </p>
        
        {rewards.loot.length > 0 ? (
          <>
            <p className="text-gray-300 mb-1">Loot:</p>
            <ul className="list-disc list-inside text-gray-300">
              {rewards.loot.map((item, index) => (
                <li key={index} className="text-gray-300">
                  {item.name} 
                  <span className="text-gray-400 text-xs ml-1">({item.type}, {item.rarity})</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-gray-500 italic">No loot was found</p>
        )}
        
        <button 
          className="w-full bg-green-800 hover:bg-green-700 text-white py-2 rounded-lg mt-4"
          onClick={resetCombat}
        >
          Continue
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 p-6 rounded-lg mb-6">
        <h1 className="text-3xl md:text-5xl font-gothic text-red-500 text-center">Combat Arena</h1>
        <p className="text-center text-gray-300 mt-4">Test your skills against various enemies!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Character */}
        <div className="md:col-span-3 space-y-4">
          {renderPlayerInfo()}
          {renderCombatControls()}
        </div>

        {/* Middle Column - Combat Area */}
        <div className="md:col-span-6 space-y-4">
          {inProgress || combatLog.length > 0 ? (
            <>
              {renderEnemyInfo()}
              {renderCombatLog()}
              {!inProgress && rewards && renderRewards()}
            </>
          ) : (
            <div className="bg-black/60 border-2 border-red-900/30 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
              <p className="text-xl text-gray-300 mb-4">Ready for Battle?</p>
              <p className="text-gray-400 mb-6">Select an enemy level and start combat!</p>
              <button 
                className="bg-red-900 hover:bg-red-800 text-white py-2 px-8 rounded-lg"
                onClick={startCombat}
              >
                Fight!
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Enemy Details/Skills */}
        <div className="md:col-span-3 space-y-4">
          {enemy && (
            <div className="bg-black/60 border border-red-900/30 rounded-lg p-4">
              <h3 className="text-red-400 text-lg mb-2">Enemy Details</h3>
              <p className="text-gray-300 mb-4">{enemy.description || "A dangerous foe stands before you, ready to attack."}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="text-yellow-400">{enemy.experience}</span>
                </div>
                
                {enemy.loot && enemy.loot.length > 0 && (
                  <div>
                    <p className="text-gray-400 mb-1">Possible Loot:</p>
                    <ul className="list-disc list-inside text-gray-500">
                      {enemy.loot.map((item, index) => (
                        <li key={index}>{item.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-black/60 border border-red-900/30 rounded-lg p-4">
            <h3 className="text-red-400 text-lg mb-2">Your Skills</h3>
            {character.skills.length > 0 ? (
              <div className="space-y-3">
                {character.skills.map((skill) => (
                  <div key={skill.id} className="border-b border-red-900/20 pb-2 mb-2 last:border-0">
                    <h4 className="text-gray-200">{skill.name}</h4>
                    <p className="text-gray-400 text-sm">{skill.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills available</p>
            )}
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

export default Combat; 