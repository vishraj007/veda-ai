'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/create.module.css';
import { useFormStore } from '@/store/useFormStore';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import FileUpload from './FileUpload';
import QuestionTypeRow from './QuestionTypeRow';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { DifficultyLevel, ExamPattern, BloomLevel } from '@/store/useFormStore';

const SUBJECTS = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Social Science', label: 'Social Science' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => ({
  value: `Class ${i + 1}`,
  label: `Class ${i + 1}`,
}));

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', emoji: '🟢', desc: 'Basic recall & understanding' },
  { value: 'medium', label: 'Medium', emoji: '🟡', desc: 'Application & analysis' },
  { value: 'hard', label: 'Hard', emoji: '🔴', desc: 'Critical thinking & evaluation' },
  { value: 'hybrid', label: 'Hybrid', emoji: '⚙️', desc: 'Custom % of easy, medium, hard' },
];

const EXAM_PATTERNS: { value: ExamPattern; label: string; icon: string; desc: string }[] = [
  { value: 'cbse', label: 'CBSE', icon: '🏛️', desc: 'Standard CBSE pattern' },
  { value: 'mcq_quiz', label: 'MCQ Quiz', icon: '✅', desc: '20 multiple choice' },
  { value: 'unit_test', label: 'Unit Test', icon: '📝', desc: 'Quick assessment' },
  { value: 'mid_term', label: 'Mid-Term', icon: '📖', desc: 'Comprehensive exam' },
  { value: 'final_exam', label: 'Final Exam', icon: '🎓', desc: 'Full syllabus exam' },
];

const BLOOM_LEVELS: { value: BloomLevel; label: string; color: string }[] = [
  { value: 'remember', label: '🧠 Remember', color: '#DCFCE7' },
  { value: 'understand', label: '💡 Understand', color: '#DBEAFE' },
  { value: 'apply', label: '🔧 Apply', color: '#FEF3C7' },
  { value: 'analyze', label: '🔍 Analyze', color: '#FCE7F3' },
  { value: 'evaluate', label: '⚖️ Evaluate', color: '#EDE9FE' },
  { value: 'create', label: '🎨 Create', color: '#FEE2E2' },
];

interface AssignmentFormProps {
  toolTitle?: string;
  toolSubtitle?: string;
}

export default function AssignmentForm({ toolTitle, toolSubtitle }: AssignmentFormProps) {
  const router = useRouter();
  const form = useFormStore();
  const { createAssignment, loading } = useAssignmentStore();

  const handleSubmit = async () => {
    if (!form.validate()) {
      // Show specific errors in toast
      const summary = form.getValidationSummary();
      if (summary.length > 0) {
        toast.error(
          (t) => (
            <div style={{ fontSize: '13px' }}>
              <strong style={{ display: 'block', marginBottom: '6px' }}>⚠️ Please fix the following:</strong>
              {summary.map((msg, i) => (
                <div key={i} style={{ marginBottom: '3px', paddingLeft: '8px' }}>• {msg}</div>
              ))}
            </div>
          ),
          { duration: 6000, style: { maxWidth: '420px' } }
        );
      }
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        subject: form.subject,
        className: form.className,
        schoolName: form.schoolName,
        dueDate: form.dueDate,
        questionTypes: form.questionTypes.map((qt) => ({
          type: qt.type,
          numberOfQuestions: qt.numberOfQuestions,
          marksPerQuestion: qt.marksPerQuestion,
        })),
        additionalInstructions: form.additionalInstructions || '',
        difficulty: form.difficulty,
        bloomLevels: form.bloomLevels,
      };

      // Include distribution only for hybrid mode
      if (form.difficulty === 'hybrid') {
        payload.difficultyDistribution = form.difficultyDistribution;
      }

      const assignmentId = await createAssignment(payload);
      toast.success('Assignment created! Generating question paper...');
      form.resetForm();
      router.push(`/output/${assignmentId}`);
    } catch {
      toast.error('Failed to create assignment. Please try again.');
    }
  };

  return (
    <div className={styles.createPage}>
      {/* Header */}
      <div className={styles.createHeader}>
        <h1 className={styles.createTitle}>
          <span className={styles.createTitleDot} />
          {toolTitle || 'Create Assignment'}
        </h1>
        <p className={styles.createSubtitle}>{toolSubtitle || 'Set up a new assignment for your students'}</p>
      </div>

      {/* Step Bar */}
      <div className={styles.stepBar}>
        <div className={styles.stepProgress} style={{ width: `${form.currentStep * 50}%` }} />
      </div>

      {/* Form Card */}
      <div className={styles.formCard}>
        <div className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Assignment Details</h2>
          <p className={styles.formSectionDesc}>Basic information about your assignment</p>
        </div>

        {/* File Upload */}
        <div className={styles.formSection}>
          <FileUpload />
        </div>

        {/* Title + Subject + Class + School */}
        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <Input
              label="Assignment Title"
              placeholder="e.g. Quiz on Electricity"
              value={form.title}
              onChange={(e) => form.setField('title', e.target.value)}
              onBlur={() => form.touchField('title')}
              error={form.touched.title ? form.errors.title : undefined}
            />
            <Select
              label="Subject"
              options={SUBJECTS}
              placeholder="Select Subject"
              value={form.subject}
              onChange={(e) => form.setField('subject', e.target.value)}
              error={form.touched.subject ? form.errors.subject : undefined}
            />
            <Select
              label="Class"
              options={CLASSES}
              placeholder="Select Class"
              value={form.className}
              onChange={(e) => form.setField('className', e.target.value)}
              error={form.touched.className ? form.errors.className : undefined}
            />
            <Input
              label="School Name"
              placeholder="e.g. Delhi Public School"
              value={form.schoolName}
              onChange={(e) => form.setField('schoolName', e.target.value)}
              error={form.touched.schoolName ? form.errors.schoolName : undefined}
            />
          </div>
        </div>

        {/* Due Date */}
        <div className={styles.formSection}>
          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => form.setField('dueDate', e.target.value)}
            onBlur={() => form.touchField('dueDate')}
            error={form.touched.dueDate ? form.errors.dueDate : undefined}
            icon={<span>📅</span>}
          />
        </div>

        {/* ══════ EXAM PATTERN TEMPLATES ══════ */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle} style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-1)' }}>
            Exam Pattern Template
          </h3>
          <p className={styles.formSectionDesc}>Select a preset to auto-fill question types</p>
          <div className={styles.templateGrid}>
            {EXAM_PATTERNS.map((pattern) => (
              <button
                key={pattern.value}
                type="button"
                className={`${styles.templateCard} ${form.examPattern === pattern.value ? styles.templateActive : ''}`}
                onClick={() => form.applyExamTemplate(pattern.value)}
              >
                <span className={styles.templateIcon}>{pattern.icon}</span>
                <span className={styles.templateLabel}>{pattern.label}</span>
                <span className={styles.templateDesc}>{pattern.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══════ DIFFICULTY SLIDER ══════ */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle} style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-1)' }}>
            Difficulty Level
          </h3>
          <p className={styles.formSectionDesc}>Set the overall difficulty for generated questions</p>
          <div className={styles.difficultySlider}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.difficultyOption} ${form.difficulty === opt.value ? styles.difficultyActive : ''}`}
                onClick={() => form.setDifficulty(opt.value)}
              >
                <span className={styles.diffEmoji}>{opt.emoji}</span>
                <span className={styles.diffLabel}>{opt.label}</span>
                <span className={styles.diffDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>

          {/* ── Hybrid Percentage Inputs ── */}
          {form.difficulty === 'hybrid' && (
            <div className={styles.hybridDistribution}>
              <p className={styles.hybridLabel}>Set percentage for each difficulty level (must total 100%)</p>
              <div className={styles.hybridInputs}>
                {(['easy', 'medium', 'hard'] as const).map((level) => {
                  const emoji = level === 'easy' ? '🟢' : level === 'medium' ? '🟡' : '🔴';
                  const label = level.charAt(0).toUpperCase() + level.slice(1);
                  return (
                    <div key={level} className={styles.hybridInputGroup}>
                      <label className={styles.hybridInputLabel}>
                        {emoji} {label}
                      </label>
                      <div className={styles.hybridSliderWrap}>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={form.difficultyDistribution[level]}
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value, 10);
                            const otherKeys = (['easy', 'medium', 'hard'] as const).filter((k) => k !== level);
                            const remaining = 100 - newVal;
                            const otherTotal = otherKeys.reduce((s, k) => s + form.difficultyDistribution[k], 0);
                            if (otherTotal > 0) {
                              otherKeys.forEach((k) => {
                                const proportion = form.difficultyDistribution[k] / otherTotal;
                                form.setDifficultyDistribution(k, Math.round(remaining * proportion));
                              });
                            } else {
                              otherKeys.forEach((k, i) => {
                                form.setDifficultyDistribution(k, i === 0 ? Math.ceil(remaining / 2) : Math.floor(remaining / 2));
                              });
                            }
                            form.setDifficultyDistribution(level, newVal);
                          }}
                          className={styles.hybridRange}
                        />
                        <span className={styles.hybridValue}>{form.difficultyDistribution[level]}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const total = form.difficultyDistribution.easy + form.difficultyDistribution.medium + form.difficultyDistribution.hard;
                return total !== 100 ? (
                  <p className={styles.hybridWarning}>⚠️ Total is {total}% — must equal 100%</p>
                ) : (
                  <p className={styles.hybridValid}>✅ Distribution is valid (100%)</p>
                );
              })()}
            </div>
          )}
        </div>

        {/* ══════ BLOOM'S TAXONOMY ══════ */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle} style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-1)' }}>
            Bloom&apos;s Taxonomy
          </h3>
          <p className={styles.formSectionDesc}>Select cognitive levels to target (optional)</p>
          <div className={styles.bloomGrid}>
            {BLOOM_LEVELS.map((level) => {
              const isSelected = form.bloomLevels.includes(level.value);
              return (
                <button
                  key={level.value}
                  type="button"
                  className={`${styles.bloomChip} ${isSelected ? styles.bloomActive : ''}`}
                  style={{
                    background: isSelected ? level.color : undefined,
                    borderColor: isSelected ? level.color : undefined,
                  }}
                  onClick={() => form.toggleBloomLevel(level.value)}
                >
                  {level.label}
                  {isSelected && <span className={styles.bloomCheck}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════ QUESTION TYPES ══════ */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle} style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
            Question Type
          </h3>
          {form.errors.questionTypes && (
            <div className={styles.generalError}>{form.errors.questionTypes}</div>
          )}
          <div className={styles.qtHeader}>
            <span>Question Type</span>
            <span>No. of Questions</span>
            <span>Marks</span>
            <span></span>
          </div>
          {form.questionTypes.map((qt) => (
            <QuestionTypeRow
              key={qt.id}
              row={qt}
              canRemove={form.questionTypes.length > 1}
            />
          ))}
          <button className={styles.addTypeBtn} onClick={form.addQuestionType} type="button">
            <span className={styles.addTypeIcon}>+</span>
            Add Question Type
          </button>

          <div className={styles.totals}>
            Total Questions : <strong>{form.getTotalQuestions()}</strong>
            <br />
            Total Marks : <strong>{form.getTotalMarks()}</strong>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle} style={{ fontSize: 'var(--font-size-base)' }}>
            Additional Information (For better output)
          </h3>
          <textarea
            className={styles.textarea}
            placeholder="e.g. Generate a question paper for 3 hour exam duration, focus on chapter 5 and 6..."
            value={form.additionalInstructions}
            onChange={(e) => form.setField('additionalInstructions', e.target.value)}
            maxLength={1000}
          />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <Button variant="secondary" onClick={() => router.back()} icon={<span>←</span>}>
          Previous
        </Button>
        <Button variant="dark" onClick={handleSubmit} loading={loading}>
          Next <span>→</span>
        </Button>
      </div>
    </div>
  );
}
