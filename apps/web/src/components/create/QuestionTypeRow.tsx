'use client';

import React from 'react';
import styles from '@/styles/create.module.css';
import { useFormStore, type QuestionTypeRow as QTRow } from '@/store/useFormStore';
import { QUESTION_TYPES } from '@vedaai/shared';

interface QuestionTypeRowProps {
  row: QTRow;
  canRemove: boolean;
}

export default function QuestionTypeRow({ row, canRemove }: QuestionTypeRowProps) {
  const { updateQuestionType, removeQuestionType } = useFormStore();

  return (
    <div className={styles.qtRow}>
      <select
        className={styles.numberValue}
        value={row.type}
        onChange={(e) => updateQuestionType(row.id, 'type', e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          background: 'var(--color-bg)',
          outline: 'none',
          appearance: 'none' as const,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          cursor: 'pointer',
        }}
      >
        {QUESTION_TYPES.map((qt) => (
          <option key={qt.value} value={qt.value}>{qt.label}</option>
        ))}
      </select>

      <div className={styles.numberInput}>
        <button
          className={styles.numberBtn}
          onClick={() => updateQuestionType(row.id, 'numberOfQuestions', Math.max(1, row.numberOfQuestions - 1))}
          type="button"
        >−</button>
        <input
          className={styles.numberValue}
          type="number"
          value={row.numberOfQuestions}
          onChange={(e) => updateQuestionType(row.id, 'numberOfQuestions', Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
        />
        <button
          className={styles.numberBtn}
          onClick={() => updateQuestionType(row.id, 'numberOfQuestions', row.numberOfQuestions + 1)}
          type="button"
        >+</button>
      </div>

      <div className={styles.numberInput}>
        <button
          className={styles.numberBtn}
          onClick={() => updateQuestionType(row.id, 'marksPerQuestion', Math.max(1, row.marksPerQuestion - 1))}
          type="button"
        >−</button>
        <input
          className={styles.numberValue}
          type="number"
          value={row.marksPerQuestion}
          onChange={(e) => updateQuestionType(row.id, 'marksPerQuestion', Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
        />
        <button
          className={styles.numberBtn}
          onClick={() => updateQuestionType(row.id, 'marksPerQuestion', row.marksPerQuestion + 1)}
          type="button"
        >+</button>
      </div>

      <button
        className={styles.qtRemove}
        onClick={() => canRemove && removeQuestionType(row.id)}
        type="button"
        disabled={!canRemove}
        style={{ opacity: canRemove ? 1 : 0.3 }}
      >✕</button>
    </div>
  );
}
