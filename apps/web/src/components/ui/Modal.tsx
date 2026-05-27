'use client';

import React from 'react';
import styles from '@/styles/components.module.css';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export default function Modal({ open, onClose, title, children, onConfirm, confirmText = 'Confirm', confirmVariant = 'primary', loading }: ModalProps) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.modalActions}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
