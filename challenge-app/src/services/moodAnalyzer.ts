
import { AppState, ChallengeCategory, UserMood } from '../types';
import { CHALLENGES, SILENT_DAY_CHALLENGE } from '../constants';

export const moodAnalyzer = {
  /**
   * Adaptive Logic: Determines the best category for today based on yesterday's reflection
   */
  recommendCategory: (lastReflection: any): ChallengeCategory => {
    if (!lastReflection) return 'Mindfulness';

    const { energy, mood } = lastReflection;

    // High energy but heavy mood? -> Mindfulness/Rest
    if (energy >= 4 && mood === 'Heavy') return 'Mindfulness';
    
    // Low energy? -> Rest
    if (energy <= 2) return 'Rest';
    
    // High energy and good mood? -> Active or Productivity
    if (energy >= 4 && mood === 'Good') return 'Active';

    return 'Productivity';
  },

  /**
   * Reverse Challenge Logic: 10% chance to give a challenge that breaks patterns
   */
  shouldGiveReverseChallenge: (): boolean => Math.random() < 0.15,

  /**
   * Silent Day Logic: 5% chance or once a month
   */
  isSilentDayTriggered: (dateStr: string): boolean => {
    const day = new Date(dateStr).getDate();
    return day === 15 || Math.random() < 0.05; 
  }
};
