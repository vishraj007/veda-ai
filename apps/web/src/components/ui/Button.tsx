'use client';

import React from 'react';
import styles from '@/styles/components.module.css';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantMap: Record<string, string> = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  dark: styles.btnDark,
  danger: styles.btnDanger,
  ghost: styles.btnGhost,
};

const sizeMap: Record<string, string> = {
  sm: styles.btnSm,
  md: styles.btnMd,
  lg: styles.btnLg,
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.btn,
        variantMap[variant],
        sizeMap[size],
        fullWidth && styles.btnFull,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : icon}
      {children}
    </button>
  );
}
