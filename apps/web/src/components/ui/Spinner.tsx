import React from 'react';
import styles from '@/styles/components.module.css';

interface SpinnerProps {
  size?: 'sm' | 'lg';
  text?: string;
}

export default function Spinner({ size = 'lg', text }: SpinnerProps) {
  if (size === 'sm') {
    return <span className={styles.spinner} />;
  }

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinnerLg} />
      {text && <p className={styles.spinnerText}>{text}</p>}
    </div>
  );
}
