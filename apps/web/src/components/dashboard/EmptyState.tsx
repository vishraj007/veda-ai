'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';
import Button from '@/components/ui/Button';

export default function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIllustration}>
        <div className={styles.emptyCircle} />
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          {/* Magnifying glass */}
          <circle cx="85" cy="85" r="35" stroke="#D1D5DB" strokeWidth="4" fill="#F3F4F6" />
          <line x1="110" y1="110" x2="135" y2="135" stroke="#D1D5DB" strokeWidth="4" strokeLinecap="round" />
          {/* Lines in glass */}
          <line x1="70" y1="78" x2="95" y2="78" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="88" x2="90" y2="88" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
          {/* Red X */}
          <circle cx="120" cy="70" r="20" fill="#FEE2E2" />
          <line x1="112" y1="62" x2="128" y2="78" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="128" y1="62" x2="112" y2="78" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          {/* Decorative dots */}
          <circle cx="55" cy="115" r="3" fill="#D1D5DB" />
          <circle cx="145" cy="55" r="2" fill="#D1D5DB" />
          <circle cx="150" cy="90" r="4" fill="#E5E7EB" />
          {/* Sparkle */}
          <path d="M45 70 L48 65 L51 70 L48 75Z" fill="#D1D5DB" />
          <path d="M155 40 L157 36 L159 40 L157 44Z" fill="#E5E7EB" />
        </svg>
      </div>
      <h2 className={styles.emptyTitle}>No assignments yet</h2>
      <p className={styles.emptyDesc}>
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link href="/create">
        <Button variant="dark" size="lg" icon={<span>+</span>}>
          Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}
