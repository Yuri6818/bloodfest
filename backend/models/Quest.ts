import { Schema, model, Document, Types } from 'mongoose';

export interface IQuest extends Document {
  title: string;
  description: string;
  storyText: string;
  type: 'main' | 'side' | 'class' | 'faction' | 'event';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  levelRequirement: number;
  classRestriction?: string[];
  factionRestriction?: string[];
  location: string;
  objectives: {
    description: string;
    targetCount?: number;
    currentCount?: number;
    completed: boolean;
  }[];
  rewards: {
    experience: number;
    gold: number;
    items?: Types.ObjectId[];
    reputation?: {
      faction: string;
      amount: number;
    }[];
  };
  followUpQuest?: Types.ObjectId;
  prerequisiteQuests?: Types.ObjectId[];
  isAvailable: boolean;
  isRepeatable: boolean;
  cooldown?: number;
}

const questSchema = new Schema<IQuest>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  storyText: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['main', 'side', 'class', 'faction', 'event'],
    default: 'side'
  },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['easy', 'medium', 'hard', 'epic'],
    default: 'medium'
  },
  levelRequirement: { type: Number, default: 1 },
  classRestriction: [String],
  factionRestriction: [String],
  location: { type: String, required: true },
  objectives: [{
    description: { type: String, required: true },
    targetCount: Number,
    currentCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  rewards: {
    experience: { type: Number, required: true },
    gold: { type: Number, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    reputation: [{
      faction: String,
      amount: Number
    }]
  },
  followUpQuest: { type: Schema.Types.ObjectId, ref: 'Quest' },
  prerequisiteQuests: [{ type: Schema.Types.ObjectId, ref: 'Quest' }],
  isAvailable: { type: Boolean, default: true },
  isRepeatable: { type: Boolean, default: false },
  cooldown: Number
});

export const Quest = model<IQuest>('Quest', questSchema);

// Pre-defined sample quests
export const SampleQuests = [
  // Main Story Quest
  {
    title: "The Awakening Darkness",
    description: "Strange occurrences plague the city of Ravenhollow. Investigate the source of the growing darkness.",
    storyText: "For centuries, Ravenhollow has maintained a fragile balance between the mortal world and the supernatural. But now, whispers spread of ancient seals breaking, of shadows that move against their casters, and of blood that refuses to dry. The Council of Night has called upon you to investigate these disturbances before panic spreads through the city.",
    type: "main",
    difficulty: "medium",
    levelRequirement: 1,
    location: "Ravenhollow - Old Town District",
    objectives: [
      {
        description: "Speak with Councilor Varleth at the Shrouded Tower",
        completed: false
      },
      {
        description: "Investigate the disappearances in the Market District",
        completed: false
      },
      {
        description: "Collect blood samples from the affected area",
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        description: "Return to Councilor Varleth with your findings",
        completed: false
      }
    ],
    rewards: {
      experience: 300,
      gold: 150,
      reputation: [
        {
          faction: "Council of Night",
          amount: 50
        }
      ]
    },
    isAvailable: true,
    isRepeatable: false
  },
  
  // Class-Specific Quests
  {
    title: "Bloodline Purity",
    description: "A rival vampire clan has insulted your bloodline. Challenge their champion to restore your honor.",
    storyText: "The Crimson Veil, a rival vampire clan, has publicly questioned the purity of your bloodline. Such an insult cannot stand among the vampire nobility. Elder Drusilla advises you to challenge their champion to a duel according to the ancient rites. Victory will restore your clan's honor and perhaps yield secrets of blood magic known only to the Crimson Veil.",
    type: "class",
    difficulty: "hard",
    levelRequirement: 5,
    classRestriction: ["Vampire"],
    location: "Ravenhollow - Midnight Court",
    objectives: [
      {
        description: "Deliver your formal challenge to the Crimson Veil's manor",
        completed: false
      },
      {
        description: "Prepare for the duel by drinking three different blood types",
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        description: "Defeat Valdis, Champion of the Crimson Veil",
        completed: false
      },
      {
        description: "Return to Elder Drusilla with news of your victory",
        completed: false
      }
    ],
    rewards: {
      experience: 500,
      gold: 300,
      reputation: [
        {
          faction: "Vampire Nobility",
          amount: 75
        },
        {
          faction: "Crimson Veil",
          amount: -50
        }
      ]
    },
    isAvailable: true,
    isRepeatable: false
  },
  
  {
    title: "The Hunter's Arsenal",
    description: "Craft specialized weapons to combat the growing vampire threat in the city.",
    storyText: "Master Thorn, the veteran Witch Hunter, has noticed an alarming increase in vampire attacks throughout the city. The standard-issue weapons are proving ineffective against these powerful foes. He's entrusted you with gathering rare materials to craft vampire-slaying weapons for the Order's arsenal.",
    type: "class",
    difficulty: "medium",
    levelRequirement: 3,
    classRestriction: ["Witch Hunter"],
    location: "Ravenhollow - Hunter's Workshop",
    objectives: [
      {
        description: "Collect silver ore from the abandoned mines",
        targetCount: 5,
        currentCount: 0,
        completed: false
      },
      {
        description: "Harvest blessed hawthorn wood from the Cathedral grounds",
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        description: "Obtain holy water from Father Caliban",
        completed: false
      },
      {
        description: "Craft three silver-tipped stakes at the Hunter's Workshop",
        targetCount: 3,
        currentCount: 0,
        completed: false
      }
    ],
    rewards: {
      experience: 350,
      gold: 200,
      reputation: [
        {
          faction: "Witch Hunter Order",
          amount: 60
        }
      ]
    },
    isAvailable: true,
    isRepeatable: true,
    cooldown: 604800 // 7 days in seconds
  },
  
  // Side Quest
  {
    title: "Whispers from the Crypt",
    description: "Strange voices emanate from the abandoned crypts beneath the old cathedral. Investigate their source.",
    storyText: "The groundskeeper of the old cathedral has reported hearing whispers and chanting coming from the sealed crypts below. The local priest dismisses it as imagination, but you sense something more sinister at work. As you approach the cathedral, the whispers grow louder in your mind, speaking in a language you shouldn't understand... but somehow do.",
    type: "side",
    difficulty: "easy",
    levelRequirement: 2,
    location: "Ravenhollow - Old Cathedral Crypts",
    objectives: [
      {
        description: "Speak with Groundskeeper Morris about the whispers",
        completed: false
      },
      {
        description: "Find a way to access the sealed crypts",
        completed: false
      },
      {
        description: "Explore the crypt passages and locate the source of the whispers",
        completed: false
      },
      {
        description: "Defeat the restless spirits (or communicate with them)",
        targetCount: 5,
        currentCount: 0,
        completed: false
      }
    ],
    rewards: {
      experience: 250,
      gold: 100
    },
    isAvailable: true,
    isRepeatable: false
  },
  
  // Event Quest
  {
    title: "Crimson Moon Festival",
    description: "A rare celestial event turns the moon blood-red. Participate in the festival while dark forces gather strength.",
    storyText: "Once every century, the Crimson Moon rises over Ravenhollow, bathing the city in blood-red light. The citizens celebrate with feasts and revelry, but ancient texts speak of the thinning veil between worlds during this time. While the festivities proceed, you notice suspicious figures gathering in the shadows. Something sinister is being planned under the cover of celebration.",
    type: "event",
    difficulty: "hard",
    levelRequirement: 7,
    location: "Ravenhollow - City Center",
    objectives: [
      {
        description: "Participate in the festival opening ceremony",
        completed: false
      },
      {
        description: "Track the suspicious figures without being detected",
        completed: false
      },
      {
        description: "Disrupt the dark ritual at the Temple Ruins",
        completed: false
      },
      {
        description: "Defeat the Cult Leader before the Crimson Moon reaches its zenith",
        completed: false
      }
    ],
    rewards: {
      experience: 800,
      gold: 500,
      reputation: [
        {
          faction: "Ravenhollow City",
          amount: 100
        }
      ]
    },
    isAvailable: true,
    isRepeatable: false
  }
];
