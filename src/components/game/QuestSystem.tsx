import { useState } from 'react';
import { useCharacter } from '@hooks/useCharacter';
import { useQuestProgress } from '@hooks/useQuestProgress';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import { Link } from 'react-router-dom';
import type { Quest } from '@types/game';

const QuestSystem = () => {
  const { character, loading: characterLoading } = useCharacter();
  const { 
    quests, 
    activeQuests, 
    loading: questsLoading, 
    error,
    startQuest,
    finishQuest,
    isQuestComplete,
    isUpdating
  } = useQuestProgress();
  
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  if (characterLoading || questsLoading) return <LoadingSpinner />;
  
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

  const handleStartQuest = async (quest: Quest) => {
    await startQuest(quest);
    setActiveTab('active');
  };

  const handleFinishQuest = async (quest: Quest) => {
    const result = await finishQuest(quest);
    if (result.success && result.rewards) {
      setRewardMessage(`Quest completed! You received ${result.rewards.experience} XP and ${result.rewards.gold} gold.`);
      if (result.rewards.items.length > 0) {
        setRewardMessage(prev => prev + ` Items: ${result.rewards.items.join(', ')}`);
      }
      setTimeout(() => setRewardMessage(null), 5000);
    }
  };

  const renderAvailableQuests = () => {
    const availableQuests = quests.filter(q => q.status === 'not_started' && character.level >= q.requirements.level);
    
    if (availableQuests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No quests available at your level.</p>
          <p className="text-gray-500 text-sm mt-2">Reach a higher level to unlock more quests!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {availableQuests.map((quest) => (
          <div 
            key={quest.id}
            className="p-4 bg-black/60 border border-red-900/30 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl text-red-400">{quest.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{quest.description}</p>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-blue-900/50 text-blue-200">
                Available
              </span>
            </div>
            
            <div className="mt-4 border-t border-red-900/10 pt-3">
              <h4 className="text-gray-300 mb-2">Requirements:</h4>
              <div className="text-sm text-gray-400">
                <p>Level {quest.requirements.level}</p>
              </div>
            </div>
            
            <div className="mt-4 border-t border-red-900/10 pt-3">
              <h4 className="text-gray-300 mb-2">Rewards:</h4>
              <div className="text-sm space-y-1">
                <p className="text-yellow-400">{quest.rewards.experience} XP</p>
                {quest.rewards.gold && <p className="text-yellow-400">{quest.rewards.gold} Gold</p>}
                {quest.rewards.items && quest.rewards.items.length > 0 && (
                  <div className="text-green-400">
                    {quest.rewards.items.map((item, idx) => (
                      <span key={idx}>{typeof item === 'string' ? item : item.name}</span>
                    )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[])}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-900 hover:bg-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStartQuest(quest)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : 'Accept Quest'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveQuests = () => {
    if (activeQuests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">You have no active quests.</p>
          <p className="text-gray-500 text-sm mt-2">Accept a quest to get started!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {activeQuests.map((quest) => {
          const isComplete = isQuestComplete(quest);
          
          return (
            <div 
              key={quest.id}
              className="p-4 bg-black/60 border border-red-900/30 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl text-red-400">{quest.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{quest.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  isComplete ? 'bg-green-900/50 text-green-200' : 'bg-yellow-900/50 text-yellow-200'
                }`}>
                  {isComplete ? 'Ready to Turn In' : 'In Progress'}
                </span>
              </div>
              
              {quest.objectives && (
                <div className="mt-4 border-t border-red-900/10 pt-3">
                  <h4 className="text-gray-300 mb-2">Objectives:</h4>
                  <ul className="space-y-1">
                    {quest.objectives.map((objective) => {
                      const progress = quest.progress?.objectives[objective.id] || 0;
                      const isObjectiveComplete = progress >= objective.required;
                      
                      return (
                        <li key={objective.id} className="flex items-center text-sm">
                          <span className={`mr-2 ${isObjectiveComplete ? 'text-green-400' : 'text-gray-400'}`}>
                            {isObjectiveComplete ? '✓' : '○'}
                          </span>
                          <span className={isObjectiveComplete ? 'text-green-400' : 'text-gray-300'}>
                            {objective.description}
                          </span>
                          <span className="ml-auto">
                            {progress}/{objective.required}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isComplete ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={() => isComplete && handleFinishQuest(quest)}
                  disabled={!isComplete || isUpdating}
                >
                  {isUpdating ? 'Processing...' : (isComplete ? 'Turn In' : 'Incomplete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCompletedQuests = () => {
    const completedQuests = quests.filter(q => q.status === 'completed');
    
    if (completedQuests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">You haven't completed any quests yet.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {completedQuests.map((quest) => (
          <div 
            key={quest.id}
            className="p-4 bg-black/60 border border-green-900/30 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl text-green-400">{quest.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{quest.description}</p>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-green-900/50 text-green-200">
                Completed
              </span>
            </div>
            
            {quest.objectives && (
              <div className="mt-4 border-t border-green-900/10 pt-3">
                <h4 className="text-gray-300 mb-2">Objectives:</h4>
                <ul className="space-y-1">
                  {quest.objectives.map((objective) => (
                    <li key={objective.id} className="flex items-center text-sm">
                      <span className="mr-2 text-green-400">✓</span>
                      <span className="text-green-400">{objective.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col gap-6 md:gap-8">
      <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 p-6 md:p-8 rounded-lg">
        <h1 className="text-3xl md:text-5xl font-gothic text-red-500 text-center mb-4">Quests</h1>
        <p className="text-xl text-gray-300 text-center">
          Complete quests to earn rewards and uncover the story
        </p>
      </div>

      {rewardMessage && (
        <div className="bg-green-900/30 backdrop-blur-sm border-2 border-green-700/50 p-4 rounded-lg">
          <p className="text-green-200 text-center">{rewardMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 backdrop-blur-sm border-2 border-red-700/50 p-4 rounded-lg">
          <p className="text-red-200 text-center">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quest Categories */}
        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 p-6 rounded-lg md:col-span-3">
          <h2 className="text-2xl font-gothic text-red-500 mb-6">Categories</h2>
          <ul className="space-y-2">
            <li 
              className={`p-3 ${activeTab === 'available' ? 'bg-red-900/30 text-red-200' : 'bg-dark-lighter text-gray-300'} rounded cursor-pointer hover:bg-red-900/50 transition-all`}
              onClick={() => setActiveTab('available')}
            >
              Available Quests
            </li>
            <li 
              className={`p-3 ${activeTab === 'active' ? 'bg-red-900/30 text-red-200' : 'bg-dark-lighter text-gray-300'} rounded cursor-pointer hover:bg-red-900/50 transition-all`}
              onClick={() => setActiveTab('active')}
            >
              Active Quests
            </li>
            <li 
              className={`p-3 ${activeTab === 'completed' ? 'bg-red-900/30 text-red-200' : 'bg-dark-lighter text-gray-300'} rounded cursor-pointer hover:bg-red-900/50 transition-all`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Quests
            </li>
          </ul>
        </div>

        {/* Quest List */}
        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 p-6 rounded-lg md:col-span-9">
          <h2 className="text-2xl font-gothic text-red-500 mb-6">
            {activeTab === 'available' ? 'Available Quests' : 
             activeTab === 'active' ? 'Active Quests' : 
             'Completed Quests'}
          </h2>
          
          {activeTab === 'available' && renderAvailableQuests()}
          {activeTab === 'active' && renderActiveQuests()}
          {activeTab === 'completed' && renderCompletedQuests()}
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

export default QuestSystem; 