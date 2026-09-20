// types/achievement.types.ts
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name or emoji
  category: 'pages' | 'books' | 'streak' | 'time' | 'speed';
  requirement: number;
  points: number;
  unlockedAt?: string; // ISO date string
  isUnlocked: boolean;
}
