import { ReaderArchetype } from '@/src/types/profile.types';

export interface OnboardingGoalOption {
  minutes: number;
  title: string;
  caption: string;
  icon: 'hourglass-empty' | 'auto-stories' | 'check';
  recommended: boolean;
}

export interface OnboardingArchetypeOption {
  key: ReaderArchetype;
  title: string;
  subtitle: string;
  icon: 'auto-stories' | 'bedtime' | 'psychology-alt' | 'cottage';
}

export interface OnboardingAvatarPreset {
  glyph: 'menu-book' | 'local-cafe' | 'psychology' | 'light';
}

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  {
    minutes: 15,
    title: '15 mins / day',
    caption: 'Gentle Start',
    icon: 'hourglass-empty',
    recommended: false,
  },
  {
    minutes: 25,
    title: '25 mins / day (Recommended)',
    caption: 'Ideal Habit',
    icon: 'check',
    recommended: true,
  },
  {
    minutes: 45,
    title: '45 mins / day',
    caption: 'Deep Immersion',
    icon: 'auto-stories',
    recommended: false,
  },
];

export const ONBOARDING_ARCHETYPES: OnboardingArchetypeOption[] = [
  {
    key: 'bibliophile',
    title: 'Avid Bibliophile',
    subtitle: 'Lives across multiple worlds',
    icon: 'auto-stories',
  },
  {
    key: 'night-owl',
    title: 'Night Owl Reader',
    subtitle: 'Late quiet midnight pages',
    icon: 'bedtime',
  },
  {
    key: 'deep-thinker',
    title: 'Deep Thinker',
    subtitle: 'Philosophy & reflection',
    icon: 'psychology-alt',
  },
  {
    key: 'cozy-novelist',
    title: 'Cozy Novelist',
    subtitle: 'Warm drinks & slow fiction',
    icon: 'cottage',
  },
];

export const ONBOARDING_AVATAR_PRESETS: OnboardingAvatarPreset[] = [
  { glyph: 'menu-book' },
  { glyph: 'local-cafe' },
  { glyph: 'psychology' },
  { glyph: 'light' },
];

export const DEFAULT_ONBOARDING_GENRES = ['Literary Fiction', 'Philosophy'];

export const ONBOARDING_GENRES = [
  'Literary Fiction',
  'Philosophy',
  'Classics',
  'Sci-Fi & Fantasy',
  'Essays & Poetry',
  'Mystery',
];

export interface OnboardingStep {
  title: string;
  badge: string;
  description: string;
  icon: 'auto-stories' | 'military-tech' | 'bookmark-add';
  iconColor: string;
  chipClassName: string;
  badgeClassName: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Smart EPUB Reader',
    badge: 'Distraction-Free',
    description:
      'Clean typography, ambient warm beige mode, and effortless bookmarking that mimics aged paper.',
    icon: 'auto-stories',
    iconColor: '#554424',
    chipClassName: 'bg-m3-secondary-container',
    badgeClassName: 'bg-m3-surface-mid text-m3-on-surface-variant',
  },
  {
    title: 'Gamified Habits',
    badge: '+50 XP / Session',
    description:
      'Keep daily reading streaks, hit soft milestone levels, and gently elevate your daily minutes read.',
    icon: 'military-tech',
    iconColor: '#2f1500',
    chipClassName: 'bg-m3-tertiary-fixed',
    badgeClassName: 'bg-m3-primary-fixed/40 text-m3-primary',
  },
  {
    title: 'Dog-Eared Highlights',
    badge: 'Archive',
    description:
      'Extract memorable quotes, pin paper notes, and review your digital margin scribbles anytime.',
    icon: 'bookmark-add',
    iconColor: '#6c3a0c',
    chipClassName: 'bg-m3-primary-fixed',
    badgeClassName: 'bg-m3-surface-mid text-m3-on-surface-variant',
  },
];
