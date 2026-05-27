'use client';

import React, { useState } from 'react';
import styles from '@/styles/dashboard.module.css';

export default function FilterBar() {
  const [search, setSearch] = useState('');

  return (
    <div className={styles.filterBar}>
      <select className={styles.filterSelect} defaultValue="">
        <option value="">🔽 Filter By</option>
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
        <option value="name">Name (A-Z)</option>
      </select>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search Assignments"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
