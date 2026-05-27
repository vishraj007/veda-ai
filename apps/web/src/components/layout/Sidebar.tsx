'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/sidebar.module.css';
import { useUIStore } from '@/store/useUIStore';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', label: 'Home', href: '/assignments', icon: '⊞' },
  { id: 'groups', label: 'My Groups', href: '/groups', icon: '👥' },
  { id: 'assignments', label: 'Assignments', href: '/assignments', icon: '📋', showCount: true },
  { id: 'toolkit', label: "AI Teacher's Toolkit", href: '/toolkit', icon: '✨' },
  { id: 'library', label: 'My Library', href: '/library', icon: '📚' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const assignments = useAssignmentStore((s) => s.assignments);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={cn(styles.sidebar, sidebarOpen && styles.sidebarOpen)}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className={styles.logoText}>VedaAI</span>
        </div>

        {/* Create Button */}
        <Link href="/create" className={styles.createBtn} onClick={() => setSidebarOpen(false)}>
          <span>✦</span>
          Create Assignment
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(styles.navItem, isActive(item.href) && styles.navItemActive)}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.showCount && assignments.length > 0 && (
                <span className={styles.navBadge}>
                  <Badge variant="count">{assignments.length}</Badge>
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.settingsLink}>
            <span>⚙</span> Settings
          </div>
          <div className={styles.schoolCard}>
            <div className={styles.schoolAvatar}>DP</div>
            <div className={styles.schoolInfo}>
              <div className={styles.schoolName}>Delhi Public School</div>
              <div className={styles.schoolCity}>Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
