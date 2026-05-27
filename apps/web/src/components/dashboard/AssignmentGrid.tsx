'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/dashboard.module.css';
import AssignmentCard from './AssignmentCard';
import FilterBar from './FilterBar';
import Button from '@/components/ui/Button';
import type { Assignment } from '@vedaai/shared';

interface AssignmentGridProps {
  assignments: Assignment[];
}

export default function AssignmentGrid({ assignments }: AssignmentGridProps) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Assignments</h1>
        <p className={styles.pageDesc}>
          Manage and review all your created assignments and question papers.
        </p>
      </div>

      <FilterBar />

      <div className={styles.assignmentGrid}>
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment._id} assignment={assignment} />
        ))}
      </div>

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
