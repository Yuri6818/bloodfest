import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import type { Quest, QuestObjective, QuestProgress } from '../types/game';
import api from '@utils/api';

export function useQuestProgress(quest: Quest | null) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = async (objectiveId: string, amount: number = 1) => {
    if (!quest || !user) return;

    try {
      setIsUpdating(true);
      setError(null);

      const { data } = await api.post<QuestProgress>(`/game/quest/${quest.id}/progress`, {
        objectiveId,
        amount,
        userId: user.id
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quest progress');
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const checkObjectiveCompletion = (objective: QuestObjective): boolean => {
    if (!quest?.progress?.objectives) return false;
    const current = quest.progress.objectives[objective.id] || 0;
    return current >= objective.required;
  };

  const isQuestComplete = (): boolean => {
    if (!quest?.objectives || !quest.progress?.objectives) return false;
    return quest.objectives.every(obj => checkObjectiveCompletion(obj));
  };

  return {
    isUpdating,
    error,
    updateProgress,
    checkObjectiveCompletion,
    isQuestComplete,
  };
}