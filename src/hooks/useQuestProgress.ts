import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useCharacter } from './useCharacter';
import type { Quest, QuestObjective, QuestProgress } from '../types/game';
import { 
  getQuestsWithProgress, 
  getAvailableQuests, 
  getActiveQuests,
  acceptQuest,
  updateObjectiveProgress, 
  completeQuest 
} from '@utils/mockQuestService';

export function useQuestProgress(questId?: string) {
  const { user } = useAuth();
  const { character, updateCharacter, useMockData } = useCharacter();
  const [quests, setQuests] = useState<(Quest & { status?: string })[]>([]);
  const [activeQuests, setActiveQuests] = useState<(Quest & { progress: QuestProgress })[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<(Quest & { progress?: QuestProgress }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load quests on mount or when character changes
  useEffect(() => {
    if (user && character) {
      loadQuests();
    }
  }, [user, character]);

  // Load specific quest if ID is provided
  useEffect(() => {
    if (questId && quests.length > 0) {
      const quest = quests.find(q => q.id === questId);
      if (quest) {
        setSelectedQuest(quest);
      }
    }
  }, [questId, quests]);

  const loadQuests = async () => {
    if (!user || !character) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get available quests based on character level
      const availableQuests = getAvailableQuests(character);
      setQuests(availableQuests);
      
      // Get active quests
      const active = getActiveQuests(character.id);
      setActiveQuests(active);
      
    } catch (err) {
      console.error('Error loading quests:', err);
      setError('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const startQuest = async (questToStart: Quest) => {
    if (!user || !character) return false;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      const success = acceptQuest(character.id, questToStart.id);
      
      if (success) {
        // Add to active quests in character state
        const activeQuestsCopy = [...(character.quests.active || [])];
        activeQuestsCopy.push({
          id: questToStart.id,
          name: questToStart.title,
          description: questToStart.description,
          progress: 0,
          total: questToStart.objectives?.length || 1
        });
        
        // Update character with new active quest
        await updateCharacter({
          quests: {
            ...character.quests,
            active: activeQuestsCopy
          }
        });
        
        // Refresh quests
        await loadQuests();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error starting quest:', err);
      setError('Failed to start quest');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProgress = async (questToUpdate: Quest, objectiveId: string, amount: number = 1) => {
    if (!user || !character) return false;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedProgress = updateObjectiveProgress(
        character.id,
        questToUpdate.id,
        objectiveId,
        amount
      );
      
      if (updatedProgress) {
        // Refresh quests after update
        await loadQuests();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error updating quest progress:', err);
      setError('Failed to update quest progress');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const finishQuest = async (questToComplete: Quest) => {
    if (!user || !character) return false;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      const result = completeQuest(character, questToComplete.id);
      
      if (result.success && result.updatedCharacter) {
        // Update character with rewards and completed quest
        await updateCharacter(result.updatedCharacter);
        
        // Refresh quests
        await loadQuests();
        return {
          success: true,
          rewards: result.rewards
        };
      }
      
      return { success: false };
    } catch (err) {
      console.error('Error completing quest:', err);
      setError('Failed to complete quest');
      return { success: false };
    } finally {
      setIsUpdating(false);
    }
  };

  const checkObjectiveCompletion = (quest: Quest, objectiveId: string): boolean => {
    if (!quest.progress?.objectives) return false;
    
    const objective = quest.objectives?.find(o => o.id === objectiveId);
    if (!objective) return false;
    
    const current = quest.progress.objectives[objectiveId] || 0;
    return current >= objective.required;
  };

  const isQuestComplete = (quest: Quest): boolean => {
    if (!quest.objectives || !quest.progress?.objectives) return false;
    
    return quest.objectives.every(obj => 
      checkObjectiveCompletion(quest, obj.id)
    );
  };

  return {
    quests,
    activeQuests,
    selectedQuest,
    loading,
    error,
    isUpdating,
    startQuest,
    updateProgress,
    finishQuest,
    checkObjectiveCompletion,
    isQuestComplete,
    refresh: loadQuests
  };
}