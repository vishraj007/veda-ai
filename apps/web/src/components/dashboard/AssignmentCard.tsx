'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/dashboard.module.css';
import compStyles from '@/styles/components.module.css';
import { formatDate } from '@/lib/utils';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import Modal from '@/components/ui/Modal';
import type { Assignment } from '@vedaai/shared';

interface AssignmentCardProps {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteAssignment = useAssignmentStore((s) => s.deleteAssignment);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleCardClick = () => {
    if (assignment.status === 'completed') {
      router.push(`/output/${assignment._id}`);
    }
  };

  const handleDelete = async () => {
    await deleteAssignment(assignment._id);
    setDeleteModal(false);
  };

  return (
    <>
      <div className={styles.assignmentCard} onClick={handleCardClick}>
        <h3 className={styles.cardTitle}>{assignment.title}</h3>
        <div className={styles.cardDates}>
          <span className={styles.dateAssigned}>
            Assigned on : {formatDate(assignment.createdAt)}
          </span>
          <span className={styles.dateDue}>
            Due: {formatDate(assignment.dueDate)}
          </span>
        </div>
        <div ref={menuRef} style={{ position: 'absolute', top: 0, right: 0 }}>
          <button
            className={styles.menuBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="Actions"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className={compStyles.dropdown}>
              <button
                className={compStyles.dropdownItem}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  if (assignment.status === 'completed') router.push(`/output/${assignment._id}`);
                }}
              >
                View Assignment
              </button>
              <button
                className={`${compStyles.dropdownItem} ${compStyles.dropdownDanger}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setDeleteModal(true);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Assignment"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
      >
        Are you sure you want to delete &quot;{assignment.title}&quot;? This action cannot be undone.
      </Modal>
    </>
  );
}
