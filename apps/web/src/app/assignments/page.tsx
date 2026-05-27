'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import EmptyState from '@/components/dashboard/EmptyState';
import AssignmentCard from '@/components/dashboard/AssignmentCard';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from '@/styles/dashboard.module.css';

type SortOption = 'recent' | 'oldest' | 'name' | '';

export default function AssignmentsPage() {
  const { assignments, loading, fetchAssignments } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = useMemo(() => {
    let result = [...assignments];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [assignments, search, sort]);

  if (loading && assignments.length === 0) {
    return <Spinner text="Loading assignments..." />;
  }

  if (assignments.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Assignments</h1>
        <p className={styles.pageDesc}>
          Manage and review all your created assignments and question papers.
        </p>
      </div>

      {/* Filter Bar — now functional */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="">🔽 Sort By</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by title, subject, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Results info */}
      {search && (
        <div className={styles.resultsInfo}>
          Showing {filtered.length} of {assignments.length} assignments
          {search && <span> matching &quot;{search}&quot;</span>}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.noResults}>
          <p>No assignments match your filters.</p>
          <button className={styles.clearFilters} onClick={() => { setSearch(''); setSort(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.assignmentGrid}>
          {filtered.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}

      <div className={styles.bottomAction}>
        <Link href="/create">
          <Button variant="dark" icon={<span>+</span>}>
            Create Assignment
          </Button>
        </Link>
      </div>
    </div>
  );
}
