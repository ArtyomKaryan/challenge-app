
export type ChallengeCategory = 'Active' | 'Rest' | 'Mindfulness' | 'Productivity';
export type UserMood = 'Good' | 'Neutral' | 'Heavy';

export interface Challenge {
  id: number;
  text: string;
  emoji: string;
  category: ChallengeCategory;
  mysteryReveal?: string; // The "realization" text shown after completion
}

export interface DayReflection {
  date: string; // ISO YYYY-MM-DD
  mood: UserMood;
  difficulty: string;
  energy: number; // 1-5
}

export interface AppState {
  lastUpdatedDate: string;
  currentChallengeId: number | null;
  isCompleted: boolean;
  isMysteryRevealed: boolean;
  isReflectionDone: boolean;
  history: {
    challengeId: number;
    date: string;
  }[];
  reflections: DayReflection[];
  isSilentDay: boolean;
}
