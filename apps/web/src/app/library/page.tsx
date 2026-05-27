'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/library.module.css';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function LibraryPage() {
  const router = useRouter();
  const { assignments, fetchAssignments } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssignments();
    // Load starred from localStorage
    const saved = localStorage.getItem('vedaai_starred');
    if (saved) setStarred(new Set(JSON.parse(saved)));
  }, [fetchAssignments]);

  const completedPapers = assignments.filter((a) => a.status === 'completed');

  const filtered = completedPapers.filter((a) => {
    const matchesSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !filterSubject || a.subject === filterSubject;
    const matchesClass = !filterClass || a.className === filterClass;
    return matchesSearch && matchesSubject && matchesClass;
  });

  const subjects = [...new Set(completedPapers.map((a) => a.subject))];
  const classes = [...new Set(completedPapers.map((a) => a.className))];

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('vedaai_starred', JSON.stringify([...next]));
      return next;
    });
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await api.get(`/assignments/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className={styles.libraryPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>📚</span>
            My Library
          </h1>
          <p className={styles.subtitle}>Browse and manage all your generated question papers</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={cn(styles.statIcon, styles.statIconPurple)}>📄</div>
          <div>
            <div className={styles.statValue}>{completedPapers.length}</div>
            <div className={styles.statLabel}>Total Papers</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={cn(styles.statIcon, styles.statIconOrange)}>⭐</div>
          <div>
            <div className={styles.statValue}>{starred.size}</div>
            <div className={styles.statLabel}>Starred Papers</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={cn(styles.statIcon, styles.statIconGreen)}>📊</div>
          <div>
            <div className={styles.statValue}>{subjects.length}</div>
            <div className={styles.statLabel}>Subjects</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search papers by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Papers List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h2 className={styles.emptyTitle}>No papers found</h2>
          <p className={styles.emptyDesc}>
            {completedPapers.length === 0
              ? 'Create your first assignment to see papers here.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className={styles.paperGrid}>
          {filtered.map((a) => (
            <div
              key={a._id}
              className={styles.paperCard}
              onClick={() => router.push(`/output/${a._id}`)}
            >
              <div className={styles.paperIcon}>📝</div>
              <div className={styles.paperInfo}>
                <div className={styles.paperTitle}>{a.title}</div>
                <div className={styles.paperMeta}>
                  <span>{a.subject}</span>
                  <span>•</span>
                  <span>{a.className}</span>
                  <span>•</span>
                  <span>{formatDate(a.createdAt)}</span>
                  <span>•</span>
                  <span>{a.totalQuestions} Q&apos;s · {a.totalMarks} Marks</span>
                </div>
              </div>
              <div className={styles.paperActions}>
                <button
                  className={cn(styles.iconBtn, styles.starBtn, starred.has(a._id) && styles.starred)}
                  onClick={(e) => { e.stopPropagation(); toggleStar(a._id); }}
                  title={starred.has(a._id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {starred.has(a._id) ? '★' : '☆'}
                </button>
                <button
                  className={cn(styles.iconBtn, styles.downloadBtn)}
                  onClick={(e) => { e.stopPropagation(); handleDownload(a._id, a.title); }}
                  title="Download PDF"
                >
                  ⬇
                </button>
                <button
                  className={cn(styles.iconBtn, styles.deleteBtn)}
                  onClick={(e) => { e.stopPropagation(); router.push(`/output/${a._id}`); }}
                  title="View paper"
                >
                  👁
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
