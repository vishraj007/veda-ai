'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from '@/styles/topbar.module.css';
import { useUIStore } from '@/store/useUIStore';

const pageTitles: Record<string, string> = {
  '/assignments': 'Assignment',
  '/create': 'Assignment',
  '/output': 'Grades Now',
};

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) return title;
    }
    return 'Assignment';
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button className={styles.menuBtn} onClick={toggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbIcon}>📋</span>
          {getTitle()}
        </div>
      </div>

      <div className={styles.topbarRight}>
        <button className={styles.notifBtn} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className={styles.userMenu}>
          <div className={styles.userAvatar}>VR</div>
          <span className={styles.userName}>Vishal Rawat</span>
          <span className={styles.chevron}>▾</span>
        </div>
      </div>
    </header>
  );
}
