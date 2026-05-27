import React from 'react';
import styles from '@/styles/components.module.css';

interface BadgeProps {
  variant: 'easy' | 'moderate' | 'hard' | 'default' | 'count';
  children: React.ReactNode;
}

const variantMap: Record<string, string> = {
  easy: styles.badgeEasy,
  moderate: styles.badgeModerate,
  hard: styles.badgeHard,
  default: styles.badgeDefault,
  count: styles.badgeCount,
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${variantMap[variant]}`}>
      {children}
    </span>
  );
}

/** Map difficulty string to badge variant */
export function getDifficultyVariant(difficulty: string): 'easy' | 'moderate' | 'hard' {
  switch (difficulty) {
    case 'Easy': return 'easy';
    case 'Moderate': return 'moderate';
    case 'Challenging': return 'hard';
    default: return 'moderate';
  }
}
