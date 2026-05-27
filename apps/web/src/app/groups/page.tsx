'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/groups.module.css';
import compStyles from '@/styles/components.module.css';
import { useGroupStore } from '@/store/useGroupStore';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];
const ICONS = ['🏫', '⚡', '🏆', '📐', '🧪', '📖', '🎯', '💡'];
const AVATAR_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, fetchGroups, createGroup, deleteGroup } = useGroupStore();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newIcon, setNewIcon] = useState(ICONS[0]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Group name is required');
      return;
    }
    try {
      await createGroup({
        name: newName.trim(),
        subject: newSubject.trim(),
        section: newSection.trim(),
        description: newDesc.trim(),
        color: newColor,
        icon: newIcon,
      });
      toast.success('Group created!');
      setShowModal(false);
      setNewName('');
      setNewSubject('');
      setNewSection('');
      setNewDesc('');
      setNewColor(COLORS[0]);
      setNewIcon(ICONS[0]);
    } catch {
      toast.error('Failed to create group');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteGroup(id);
      toast.success('Group deleted');
    } catch {
      toast.error('Failed to delete group');
    }
  };

  if (loading && groups.length === 0) {
    return <Spinner text="Loading groups..." />;
  }

  return (
    <div className={styles.groupsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>👥</span>
            My Groups
          </h1>
          <p className={styles.subtitle}>Organize students, assign papers, and manage your classroom</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowModal(true)}>
          + Create Group
        </button>
      </div>

      {/* Empty State */}
      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <circle cx="90" cy="90" r="70" fill="#F3F4F6" />
              <circle cx="70" cy="80" r="20" fill="#E5E7EB" />
              <circle cx="110" cy="80" r="20" fill="#E5E7EB" />
              <circle cx="90" cy="105" r="16" fill="#D1D5DB" />
              <circle cx="70" cy="80" r="12" fill="#9CA3AF" />
              <circle cx="110" cy="80" r="12" fill="#9CA3AF" />
              <circle cx="90" cy="105" r="9" fill="#6B7280" />
              <rect x="60" y="128" width="60" height="3" rx="1.5" fill="#D1D5DB" />
              <rect x="72" y="136" width="36" height="3" rx="1.5" fill="#E5E7EB" />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>No groups yet</h2>
          <p className={styles.emptyDesc}>
            Create groups to organize your students by class, batch, or subject. Add students, assign papers, and track assignments — like a mini Google Classroom.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Button variant="dark" onClick={() => setShowModal(true)} icon={<span>+</span>}>
              Create Your First Group
            </Button>
          </div>
        </div>
      ) : (
        /* Groups Grid */
        <div className={styles.groupGrid}>
          {groups.map((group) => (
            <div
              key={group._id}
              className={styles.groupCard}
              onClick={() => router.push(`/groups/${group._id}`)}
            >
              <div className={styles.groupBanner} style={{ background: group.color }} />
              <div className={styles.groupTop}>
                <div className={styles.groupIcon} style={{ background: `${group.color}20` }}>
                  {group.icon}
                </div>
                <button
                  className={styles.groupMenuBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group._id, group.name);
                  }}
                  title="Delete group"
                >
                  ✕
                </button>
              </div>
              <h3 className={styles.groupName}>{group.name}</h3>
              {(group.subject || group.section) && (
                <div className={styles.groupMeta}>
                  {group.subject && <span className={styles.subjectBadge} style={{ background: `${group.color}20`, color: group.color }}>{group.subject}</span>}
                  {group.section && <span className={styles.sectionBadge}>{group.section}</span>}
                </div>
              )}
              <p className={styles.groupDesc}>{group.description || 'No description'}</p>
              
              {/* Avatar Row */}
              {group.students.length > 0 && (
                <div className={styles.avatarRow}>
                  {group.students.slice(0, 4).map((s, i) => (
                    <div
                      key={s._id}
                      className={styles.avatar}
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      title={s.name}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {group.students.length > 4 && (
                    <div className={`${styles.avatar} ${styles.avatarMore}`}>
                      +{group.students.length - 4}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.groupStats}>
                <div className={styles.groupStat}>
                  👤 <span className={styles.groupStatValue}>{group.students.length}</span> Students
                </div>
                <div className={styles.groupStat}>
                  📋 <span className={styles.groupStatValue}>{group.assignedPapers.length}</span> Papers
                </div>
              </div>

              {/* Recent paper */}
              {group.assignedPapers.length > 0 && (
                <div className={styles.recentPaper}>
                  <span className={styles.recentLabel}>Recent:</span>
                  <span className={styles.recentTitle}>{group.assignedPapers[group.assignedPapers.length - 1].title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className={compStyles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={compStyles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 className={compStyles.modalTitle}>Create New Group</h3>
            <div className={styles.modalForm}>
              <div>
                <label className={styles.modalLabel}>Group Name *</label>
                <input
                  className={styles.modalInput}
                  placeholder="e.g. Class 11-A, Physics Batch, JEE Crash Course"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>
              <div className={styles.modalRow}>
                <div style={{ flex: 1 }}>
                  <label className={styles.modalLabel}>Subject</label>
                  <input
                    className={styles.modalInput}
                    placeholder="e.g. Physics"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.modalLabel}>Section</label>
                  <input
                    className={styles.modalInput}
                    placeholder="e.g. Section A"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label className={styles.modalLabel}>Description</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="Brief description of this group..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className={styles.modalLabel}>Icon</label>
                <div className={styles.colorPicker}>
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      className={`${styles.colorDot} ${newIcon === ic ? styles.colorDotActive : ''}`}
                      style={{ background: '#F3F4F6', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setNewIcon(ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={styles.modalLabel}>Color</label>
                <div className={styles.colorPicker}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.colorDot} ${newColor === c ? styles.colorDotActive : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={compStyles.modalActions} style={{ marginTop: '24px' }}>
              <button
                className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${compStyles.btn} ${compStyles.btnPrimary} ${compStyles.btnSm}`}
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{ opacity: newName.trim() ? 1 : 0.5 }}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
