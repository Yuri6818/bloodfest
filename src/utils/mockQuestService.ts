import type { Quest, QuestObjective, QuestProgress, Character } from '../types/game';

// Mock quest data
export const mockQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'The Awakening',
    description: 'Investigate the recent surge of undead activity in the cemetery.',
    difficulty: 1,
    objectives: [
      {
        id: 'obj-1-1',
        description: 'Defeat 3 ghouls',
        type: 'kill',
        target: 'Feral Ghoul',
        required: 3,
        current: 0
      },
      {
        id: 'obj-1-2',
        description: 'Find the necromancer\'s tome',
        type: 'collect',
        target: 'Necromancer\'s Tome',
        required: 1,
        current: 0
      }
    ],
    rewards: {
      experience: 150,
      gold: 50,
      items: ['Amulet of Protection']
    },
    requirements: {
      level: 1
    }
  },
  {
    id: 'quest-2',
    title: 'Blood Cult Rising',
    description: 'A cult dedicated to blood rituals has been forming in the dark alleys of the city.',
    difficulty: 2,
    objectives: [
      {
        id: 'obj-2-1',
        description: 'Defeat the cult leader',
        type: 'kill',
        target: 'Blood Cultist Leader',
        required: 1,
        current: 0
      },
      {
        id: 'obj-2-2',
        description: 'Destroy ritual altars',
        type: 'explore',
        target: 'Ritual Altar',
        required: 3,
        current: 0
      }
    ],
    rewards: {
      experience: 300,
      gold: 120,
      items: ['Blood Ritual Dagger']
    },
    requirements: {
      level: 2
    }
  },
  {
    id: 'quest-3',
    title: 'Howl of the Wolf',
    description: 'A pack of werewolves is terrorizing the countryside during the full moon.',
    difficulty: 3,
    objectives: [
      {
        id: 'obj-3-1',
        description: 'Track the werewolf pack',
        type: 'explore',
        target: 'Werewolf Den',
        required: 1,
        current: 0
      },
      {
        id: 'obj-3-2',
        description: 'Defeat werewolves',
        type: 'kill',
        target: 'Rabid Werewolf',
        required: 5,
        current: 0
      },
      {
        id: 'obj-3-3',
        description: 'Defeat the alpha werewolf',
        type: 'kill',
        target: 'Alpha Werewolf',
        required: 1,
        current: 0
      }
    ],
    rewards: {
      experience: 500,
      gold: 250,
      items: ['Wolfsbane Potion', 'Silver-Edged Blade']
    },
    requirements: {
      level: 3
    }
  }
];

// Track quest progress in localStorage
const QUEST_PROGRESS_KEY = 'mockQuestProgress';

// Initialize quest progress from localStorage or create new
export const initializeQuestProgress = (userId: string): Record<string, QuestProgress> => {
  try {
    const storedProgress = localStorage.getItem(`${QUEST_PROGRESS_KEY}_${userId}`);
    if (storedProgress) {
      return JSON.parse(storedProgress);
    }
  } catch (err) {
    console.error('Error loading quest progress:', err);
  }
  
  // Create default progress for all quests
  const initialProgress: Record<string, QuestProgress> = {};
  
  mockQuests.forEach(quest => {
    initialProgress[quest.id] = {
      status: 'not_started',
      objectives: {},
      updatedAt: new Date().toISOString()
    };
  });
  
  // Store the initial progress
  try {
    localStorage.setItem(`${QUEST_PROGRESS_KEY}_${userId}`, JSON.stringify(initialProgress));
  } catch (err) {
    console.error('Error storing initial quest progress:', err);
  }
  
  return initialProgress;
};

// Get all quests with their progress
export const getQuestsWithProgress = (userId: string): (Quest & { progress: QuestProgress })[] => {
  const progress = initializeQuestProgress(userId);
  
  return mockQuests.map(quest => ({
    ...quest,
    progress: progress[quest.id]
  }));
};

// Get available quests based on character level
export const getAvailableQuests = (character: Character): (Quest & { status: string })[] => {
  const progress = initializeQuestProgress(character.id);
  
  return mockQuests
    .filter(quest => {
      // Character must meet level requirement
      if (character.level < quest.requirements.level) {
        return false;
      }
      
      // Quest should not be completed already
      const questProgress = progress[quest.id];
      return questProgress.status !== 'completed';
    })
    .map(quest => {
      const status = progress[quest.id].status;
      return {
        ...quest,
        status
      };
    });
};

// Get active quests
export const getActiveQuests = (userId: string): (Quest & { progress: QuestProgress })[] => {
  const progress = initializeQuestProgress(userId);
  
  return mockQuests
    .filter(quest => progress[quest.id].status === 'in_progress')
    .map(quest => ({
      ...quest,
      progress: progress[quest.id]
    }));
};

// Accept a quest
export const acceptQuest = (userId: string, questId: string): boolean => {
  const progress = initializeQuestProgress(userId);
  
  if (!progress[questId]) {
    return false;
  }
  
  if (progress[questId].status !== 'not_started') {
    return false;
  }
  
  progress[questId].status = 'in_progress';
  progress[questId].updatedAt = new Date().toISOString();
  
  try {
    localStorage.setItem(`${QUEST_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    return true;
  } catch (err) {
    console.error('Error updating quest progress:', err);
    return false;
  }
};

// Update objective progress
export const updateObjectiveProgress = (
  userId: string,
  questId: string,
  objectiveId: string,
  amount: number = 1
): QuestProgress | null => {
  const progress = initializeQuestProgress(userId);
  
  if (!progress[questId] || progress[questId].status !== 'in_progress') {
    return null;
  }
  
  // Find the quest and objective
  const quest = mockQuests.find(q => q.id === questId);
  if (!quest) {
    return null;
  }
  
  const objective = quest.objectives?.find(o => o.id === objectiveId);
  if (!objective) {
    return null;
  }
  
  // Update progress
  const currentProgress = progress[questId].objectives[objectiveId] || 0;
  const newProgress = Math.min(objective.required, currentProgress + amount);
  
  progress[questId].objectives[objectiveId] = newProgress;
  progress[questId].updatedAt = new Date().toISOString();
  
  // Check if all objectives are completed
  const isCompleted = quest.objectives?.every(obj => {
    const objProgress = progress[questId].objectives[obj.id] || 0;
    return objProgress >= obj.required;
  });
  
  if (isCompleted) {
    progress[questId].status = 'completed';
  }
  
  // Save updated progress
  try {
    localStorage.setItem(`${QUEST_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    return progress[questId];
  } catch (err) {
    console.error('Error updating quest progress:', err);
    return null;
  }
};

// Complete a quest and claim rewards
export const completeQuest = (character: Character, questId: string): { 
  success: boolean, 
  rewards?: { 
    experience: number,
    gold: number,
    items: string[] 
  },
  updatedCharacter?: Character
} => {
  const progress = initializeQuestProgress(character.id);
  
  if (!progress[questId]) {
    return { success: false };
  }
  
  // Check if quest can be completed
  const quest = mockQuests.find(q => q.id === questId);
  if (!quest) {
    return { success: false };
  }
  
  const isCompleted = quest.objectives?.every(obj => {
    const objProgress = progress[questId].objectives[obj.id] || 0;
    return objProgress >= obj.required;
  });
  
  if (!isCompleted) {
    return { success: false };
  }
  
  // Mark as completed
  progress[questId].status = 'completed';
  progress[questId].updatedAt = new Date().toISOString();
  
  // Save progress
  try {
    localStorage.setItem(`${QUEST_PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
  } catch (err) {
    console.error('Error updating quest progress:', err);
  }
  
  // Award rewards
  const rewards = {
    experience: quest.rewards.experience || 0,
    gold: quest.rewards.gold || 0,
    items: []
  };
  
  // Convert item references to strings for display
  if (quest.rewards.items && quest.rewards.items.length > 0) {
    rewards.items = quest.rewards.items.map(item => {
      if (typeof item === 'string') {
        return item;
      } else {
        return item.name;
      }
    });
  }
  
  // Update character with rewards
  const updatedCharacter = {
    ...character,
    experience: character.experience + rewards.experience,
    gold: character.gold + rewards.gold
  };
  
  // Add quest to completed list
  const completedQuestIds = character.quests.completed || [];
  updatedCharacter.quests = {
    ...character.quests,
    completed: [...completedQuestIds, questId]
  };
  
  return {
    success: true,
    rewards,
    updatedCharacter
  };
}; 