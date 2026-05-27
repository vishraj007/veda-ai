'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/toolkit.module.css';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  accentColor: string;
  tags: string[];
  badge?: 'new' | 'pro' | 'beta';
  href: string;
  available: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'question_paper',
    name: 'Question Paper Generator',
    description: 'Create AI-powered question papers with multiple question types, difficulty levels, and Bloom\'s taxonomy support.',
    icon: '📝',
    iconBg: '#EDE9FE',
    accentColor: '#7C3AED',
    tags: ['MCQ', 'Short Answer', 'Long Answer', 'PDF Export'],
    href: '/create?tool=question_paper',
    available: true,
  },
  {
    id: 'worksheet',
    name: 'Worksheet Generator',
    description: 'Generate practice worksheets with fill-in-the-blanks, matching, and diagram-based questions for homework.',
    icon: '📋',
    iconBg: '#DBEAFE',
    accentColor: '#3B82F6',
    tags: ['Practice', 'Homework', 'Fill Blanks'],
    badge: 'new',
    href: '/create?tool=worksheet',
    available: true,
  },
  {
    id: 'quiz',
    name: 'Quiz Generator',
    description: 'Create quick MCQ quizzes for classroom pop quizzes and rapid assessments. Fast and focused.',
    icon: '⚡',
    iconBg: '#FEF3C7',
    accentColor: '#F59E0B',
    tags: ['Quick', 'MCQ Only', '10-20 Qs'],
    href: '/create?tool=quiz',
    available: true,
  },
  {
    id: 'homework',
    name: 'Homework Generator',
    description: 'Design structured homework with clear instructions and progressive difficulty. Chapter-wise support.',
    icon: '📚',
    iconBg: '#D1FAE5',
    accentColor: '#10B981',
    tags: ['Daily Practice', 'Chapter-wise'],
    href: '/create?tool=homework',
    available: true,
  },
  {
    id: 'answer_key',
    name: 'Answer Key Generator',
    description: 'Automatically generate answer keys with step-by-step solutions for any question paper.',
    icon: '🔑',
    iconBg: '#FCE7F3',
    accentColor: '#EC4899',
    tags: ['Solutions', 'Step-by-step'],
    badge: 'beta',
    href: '/create?tool=answer_key',
    available: true,
  },
  {
    id: 'lesson_plan',
    name: 'Lesson Plan Builder',
    description: 'Create structured lesson plans with learning objectives, activities, and assessment strategies.',
    icon: '🗓️',
    iconBg: '#E0E7FF',
    accentColor: '#6366F1',
    tags: ['Objectives', 'Activities', 'Assessment'],
    badge: 'pro',
    href: '#',
    available: false,
  },
  {
    id: 'rubric',
    name: 'Rubric Creator',
    description: 'Design detailed grading rubrics with criteria, levels of achievement, and point distributions.',
    icon: '📊',
    iconBg: '#FEE2E2',
    accentColor: '#EF4444',
    tags: ['Grading', 'Criteria', 'Standards'],
    badge: 'pro',
    href: '#',
    available: false,
  },
  {
    id: 'report',
    name: 'Student Report Generator',
    description: 'Generate personalized student progress reports with AI-powered insights and recommendations.',
    icon: '📈',
    iconBg: '#CCFBF1',
    accentColor: '#14B8A6',
    tags: ['Analytics', 'Progress', 'Feedback'],
    badge: 'pro',
    href: '#',
    available: false,
  },
];

const BADGE_CLASSES: Record<string, string> = {
  new: styles.badgeNew,
  pro: styles.badgePro,
  beta: styles.badgeBeta,
};

export default function ToolkitPage() {
  const router = useRouter();

  const availableTools = TOOLS.filter((t) => t.available);
  const comingSoonTools = TOOLS.filter((t) => !t.available);

  const handleToolClick = (tool: Tool) => {
    if (!tool.available) return;
    router.push(tool.href);
  };

  return (
    <div className={styles.toolkitPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>✨</span>
          AI Teacher&apos;s Toolkit
        </h1>
        <p className={styles.subtitle}>
          Powerful AI tools to help you create, assess, and manage your classroom more efficiently.
        </p>
      </div>

      {/* Featured Banner */}
      <div className={styles.featuredBanner}>
        <h2 className={styles.featuredTitle}>🎯 Create Assessments in Seconds</h2>
        <p className={styles.featuredDesc}>
          Choose from multiple AI-powered tools to generate question papers, worksheets, quizzes,
          and more. Set difficulty levels with Bloom&apos;s Taxonomy and export to PDF instantly.
        </p>
        <button className={styles.featuredBtn} onClick={() => router.push('/create?tool=question_paper')}>
          ✦ Start Creating
        </button>
      </div>

      {/* Available Tools */}
      <h2 className={styles.sectionTitle}>🛠️ Available Tools</h2>
      <div className={styles.toolGrid}>
        {availableTools.map((tool) => (
          <div
            key={tool.id}
            className={styles.toolCard}
            onClick={() => handleToolClick(tool)}
          >
            {tool.badge && (
              <span className={`${styles.toolBadge} ${BADGE_CLASSES[tool.badge]}`}>
                {tool.badge}
              </span>
            )}
            <div className={styles.toolIcon} style={{ background: tool.iconBg }}>
              {tool.icon}
            </div>
            <h3 className={styles.toolName}>{tool.name}</h3>
            <p className={styles.toolDesc}>{tool.description}</p>
            <div className={styles.toolTags}>
              {tool.tags.map((tag) => (
                <span key={tag} className={styles.toolTag}>{tag}</span>
              ))}
            </div>
            <span className={styles.toolArrow}>→</span>
          </div>
        ))}
      </div>

      {/* Coming Soon */}
      {comingSoonTools.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>🚀 Coming Soon</h2>
          <div className={styles.toolGrid}>
            {comingSoonTools.map((tool) => (
              <div key={tool.id} className={`${styles.toolCard} ${styles.comingSoon}`}>
                {tool.badge && (
                  <span className={`${styles.toolBadge} ${BADGE_CLASSES[tool.badge]}`}>
                    {tool.badge}
                  </span>
                )}
                <div className={styles.toolIcon} style={{ background: tool.iconBg }}>
                  {tool.icon}
                </div>
                <h3 className={styles.toolName}>{tool.name}</h3>
                <p className={styles.toolDesc}>{tool.description}</p>
                <div className={styles.toolTags}>
                  {tool.tags.map((tag) => (
                    <span key={tag} className={styles.toolTag}>{tag}</span>
                  ))}
                </div>
                <div className={styles.comingSoonBadge}>🔒 Coming Soon</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
