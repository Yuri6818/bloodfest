import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useCharacter } from '@hooks/useCharacter';
import { useQuestProgress } from '@hooks/useQuestProgress';
import type { Quest } from '../../types/game';
import LoadingSpinner from '@components/layout/LoadingSpinner';
import Notification from '@components/layout/Notification';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const QuestProgressBar = ({ current = 0, required }: { current?: number; required: number }) => {
  const percentage = Math.min(100, (current / required) * 100);
  return (
    <div className="w-full h-2 bg-dark-darker rounded-full overflow-hidden">
      <div
        className="h-full bg-blood transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function QuestSystem() {
  const { user } = useAuth();
  const { character, refresh: refreshCharacter } = useCharacter();
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const { 
    isUpdating, 
    error: progressError, 
    checkObjectiveCompletion,
    isQuestComplete 
  } = useQuestProgress(selectedQuest);

  useEffect(() => {
    loadQuests();
  }, [user]);

  const loadQuests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/quests/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to load quests');
      }

      const data = await response.json();
      setAvailableQuests(data.availableQuests);
      setActiveQuests(data.activeQuests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptQuest = async (quest: Quest) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/quests/${user?.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id })
      });

      if (!response.ok) {
        throw new Error('Failed to accept quest');
      }

      setActiveQuests(prev => [...prev, quest]);
      setAvailableQuests(prev => prev.filter(q => q.id !== quest.id));
      setNotification({
        message: `Accepted quest: ${quest.title}`,
        type: 'success'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept quest');
      setNotification({
        message: 'Failed to accept quest',
        type: 'error'
      });
    }
  };

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
  };

  const completeQuest = async (quest: Quest) => {
    if (!isQuestComplete()) {
      setNotification({
        message: 'Complete all objectives first!',
        type: 'error'
      });
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(`/api/quests/${user?.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id })
      });

      if (!response.ok) {
        throw new Error('Failed to complete quest');
      }

      setActiveQuests(prev => prev.filter(q => q.id !== quest.id));
      setSelectedQuest(null);
      await refreshCharacter();
      setNotification({
        message: `Completed quest: ${quest.title}! Rewards received.`,
        type: 'success'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete quest');
      setNotification({
        message: 'Failed to complete quest',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkQuestCompletion = (quest: Quest): boolean => {
    if (!character) return false;

    // Check level requirement
    if (character.level < quest.requirements.level) {
      return false;
    }

    // Check item requirements
    if (quest.requirements.items) {
      const requiredItems = quest.requirements.items;
      const inventory = character.inventory.map(item => item.name);

      return requiredItems.every(reqItem => {
        const itemName = typeof reqItem === 'string' ? reqItem : reqItem.name;
        return inventory.includes(itemName);
      });
    }

    return true;
  };

  const renderQuestObjectives = (quest: Quest) => {
    if (!quest.objectives) return null;

    return (
      <div className="mt-4">
        <h5 className="text-blood-light mb-2">Objectives:</h5>
        <div className="space-y-3">
          {quest.objectives.map(objective => {
            const current = quest.progress?.objectives[objective.id] || 0;
            const isComplete = checkObjectiveCompletion(objective);
            return (
              <div key={objective.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={isComplete ? 'text-green-400' : 'text-light-darker'}>
                    {objective.description}
                  </span>
                  <span className={isComplete ? 'text-green-400' : 'text-light-darker'}>
                    {current}/{objective.required}
                  </span>
                </div>
                <QuestProgressBar current={current} required={objective.required} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActiveQuest = (quest: Quest) => (
    <div key={quest.id} className="card bg-dark/50">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-gothic text-blood-light cursor-pointer hover:text-blood transition-colors"
              onClick={() => handleQuestClick(quest)}>
            {quest.title}
          </h4>
          <p className="text-light-darker">{quest.description}</p>
        </div>
        {isQuestComplete() && checkQuestCompletion(quest) && (
          <button
            onClick={() => completeQuest(quest)}
            className="btn btn-primary"
            disabled={isLoading || isUpdating}
          >
            {isLoading || isUpdating ? 'Processing...' : 'Complete Quest'}
          </button>
        )}
      </div>

      {renderQuestObjectives(quest)}

      {quest.requirements && (
        <div className="mt-4 text-sm">
          <h5 className="text-blood-light mb-2">Requirements:</h5>
          <ul className="space-y-1 text-light-darker">
            <li className={character && character.level >= quest.requirements.level ? 'text-green-400' : 'text-red-400'}>
              Level {quest.requirements.level}
            </li>
            {quest.requirements.items?.map((item, index) => {
              const itemName = typeof item === 'string' ? item : item.name;
              const hasItem = character?.inventory.some(invItem => invItem.name === itemName);
              return (
                <li 
                  key={`${quest.id}-req-${index}`}
                  className={hasItem ? 'text-green-400' : 'text-red-400'}
                >
                  • {itemName}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-blood/20 border border-blood text-blood-light p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={loadQuests}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {progressError && (
        <div className="bg-blood/20 border border-blood text-blood-light p-3 rounded mb-4">
          {progressError}
        </div>
      )}
      
      <h2 className="text-2xl font-gothic text-blood-light mb-6">Available Quests</h2>
      <div className="grid gap-4">
        {availableQuests.map(quest => (
          <div key={quest.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-gothic text-blood-light">{quest.title}</h3>
                <p className="text-light-darker mb-2">{quest.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                quest.difficulty >= 3
                  ? 'bg-blood/20 text-blood-light' 
                  : 'bg-accent/20 text-accent'
              }`}>
                {quest.difficulty >= 3 ? 'Hard' : 'Medium'}
              </span>
            </div>
            
            <div className="border-t border-blood/20 pt-4">
              <div className="text-sm text-light-darker mb-4">
                <h4 className="font-gothic text-blood-light mb-2">Rewards:</h4>
                <ul className="space-y-1">
                  {quest.rewards.gold && <li>{quest.rewards.gold} Gold</li>}
                  {quest.rewards.experience && <li>{quest.rewards.experience} XP</li>}
                  {quest.rewards.items?.map((item, index) => (
                    <li key={`${quest.id}-reward-${index}`}>{typeof item === 'string' ? item : item.name}</li>
                  ))}
                </ul>
              </div>
              
              <button
                className="btn btn-primary w-full"
                onClick={() => acceptQuest(quest)}
                disabled={activeQuests.some(q => q.id === quest.id)}
              >
                {activeQuests.some(q => q.id === quest.id) ? 'Quest Accepted' : 'Accept Quest'}
              </button>
            </div>
          </div>
        ))}
        
        {availableQuests.length === 0 && (
          <div className="text-center text-light-darker p-4">
            No quests available at this time
          </div>
        )}
      </div>
      
      {activeQuests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-gothic text-blood-light mb-4">Active Quests</h3>
          <div className="grid gap-4">
            {activeQuests.map(quest => renderActiveQuest(quest))}
          </div>
        </div>
      )}
    </div>
  );
}