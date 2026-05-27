'use client';

import React from 'react';
import styles from '@/styles/components.module.css';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, helper, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.inputGroup}>
      {label && (
        <label htmlFor={inputId} className={styles.inputLabel}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          className={cn(styles.input, error && styles.inputError, className)}
          {...props}
        />
        {icon && <span className={styles.inputIcon}>{icon}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {helper && !error && <span className={styles.helperText}>{helper}</span>}
    </div>
  );
}
