'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/mobilenav.module.css';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'home', label: 'Home', href: '/assignments', icon: '⊞' },
  { id: 'assignments', label: 'Assignments', href: '/assignments', icon: '📋' },
  { id: 'library', label: 'Library', href: '/library', icon: '📚' },
  { id: 'toolkit', label: 'AI Toolkit', href: '/toolkit', icon: '✨' },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <Link href="/create" className={styles.fab} aria-label="Create Assignment">
        +
      </Link>
      <nav className={styles.mobileNav}>
        <div className={styles.navTabs}>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(styles.navTab, isActive(tab.href) && styles.navTabActive)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
