'use client';

import React from 'react';
import styles from '@/styles/output.module.css';
import type { QuestionPaper } from '@vedaai/shared';

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  onDownloadPdf: () => void;
  onRegenerate: () => void;
  downloading?: boolean;
  regenerating?: boolean;
}

export default function QuestionPaperView({ paper, onDownloadPdf, onRegenerate, downloading, regenerating }: QuestionPaperViewProps) {
  const getDifficultyClass = (d: string) => {
    switch (d) {
      case 'Easy': return styles.qBadgeEasy;
      case 'Moderate': return styles.qBadgeModerate;
      case 'Challenging': return styles.qBadgeHard;
      default: return styles.qBadgeModerate;
    }
  };

  return (
    <div className={styles.outputPage}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.aiIcon}>✨</div>
        <div className={styles.aiContent}>
          <p className={styles.aiMessage}>
            Certainly! Here are your customized Question Paper for {paper.subject} {paper.className} on the selected topics.
          </p>
          <div className={styles.actionButtons}>
            <button className={styles.downloadBtn} onClick={onDownloadPdf} disabled={downloading}>
              {downloading ? '⏳' : '⬇'} Download as PDF
            </button>
            <button className={styles.regenBtn} onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? '⏳' : '🔄'} Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Paper */}
      <div className={styles.paper}>
        {/* Header */}
        <div className={styles.paperHeader}>
          <h1 className={styles.schoolName}>{paper.schoolName}</h1>
          <p className={styles.paperMeta}>Subject: {paper.subject}</p>
          <p className={styles.paperMeta}>Class: {paper.className}</p>
        </div>

        <div className={styles.metaRow}>
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.maxMarks}</span>
        </div>

        <p className={styles.instructions}>{paper.generalInstructions}</p>

        {/* Student Info */}
        <div className={styles.studentInfo}>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Name:</span>
            <span className={styles.infoBlank} />
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Roll Number:</span>
            <span className={styles.infoBlank} />
          </div>
          <div className={styles.infoLine}>
            <span className={styles.infoLabel}>Class: {paper.className}</span>
            <span style={{ marginLeft: '24px' }} className={styles.infoLabel}>Section:</span>
            <span className={styles.infoBlank} />
          </div>
        </div>

        {/* Sections */}
        {paper.sections.map((section, idx) => (
          <div key={idx} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <p className={styles.sectionType}>{section.sectionType}</p>
            <p className={styles.sectionInstruction}>{section.instruction}</p>
            {section.questions.map((q, qi) => (
              <div key={qi} className={styles.question}>
                <div className={styles.questionLine}>
                  <span className={styles.qNumber}>{q.number}.</span>
                  <span className={`${styles.qBadge} ${getDifficultyClass(q.difficulty)}`}>
                    [{q.difficulty}]
                  </span>
                  <span className={styles.qText}>{q.text}</span>
                  <span className={styles.qMarks}>[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                </div>
                {q.options && q.options.length > 0 && (
                  <div className={styles.options}>
                    {q.options.map((opt, oi) => (
                      <span key={oi}>({String.fromCharCode(97 + oi)}) {opt}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className={styles.paperFooter}>End of Question Paper</div>

        {/* Answer Key */}
        {paper.answerKey && paper.answerKey.length > 0 && (
          <div className={styles.answerKey}>
            <h2 className={styles.answerKeyTitle}>Answer Key</h2>
            {paper.answerKey.map((a, i) => (
              <div key={i} className={styles.answerItem}>
                <span className={styles.answerNumber}>{a.questionNumber}.</span>{' '}
                {a.answer}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
