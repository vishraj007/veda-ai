'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/groupdetail.module.css';
import compStyles from '@/styles/components.module.css';
import { useGroupStore } from '@/store/useGroupStore';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

type Tab = 'students' | 'assignments' | 'performance';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentGroup, loading, fetchGroup, addStudent, importStudents, removeStudent, assignPaper, unassignPaper } = useGroupStore();
  const { assignments, fetchAssignments } = useAssignmentStore();
  const [tab, setTab] = useState<Tab>('students');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [csvText, setCsvText] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGroup(id);
    fetchAssignments();
  }, [id, fetchGroup, fetchAssignments]);

  if (loading || !currentGroup) {
    return <Spinner text="Loading group..." />;
  }

  const group = currentGroup;

  const handleAddStudent = async () => {
    if (!studentName.trim()) {
      toast.error('Student name is required');
      return;
    }
    try {
      await addStudent(id, { name: studentName.trim(), email: studentEmail.trim(), rollNumber: studentRoll.trim() });
      toast.success(`${studentName.trim()} added!`);
      setStudentName('');
      setStudentEmail('');
      setStudentRoll('');
      setShowAddStudent(false);
    } catch {
      toast.error('Failed to add student');
    }
  };

  const handleCSVImport = async () => {
    const lines = csvText.trim().split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      toast.error('No data to import');
      return;
    }
    const students: { name: string; email: string; rollNumber: string }[] = [];
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts[0]) {
        students.push({
          name: parts[0],
          email: parts[1] || '',
          rollNumber: parts[2] || '',
        });
      }
    }
    if (students.length === 0) {
      toast.error('No valid students found in CSV');
      return;
    }
    try {
      const added = await importStudents(id, students);
      toast.success(`${added} students imported!`);
      setCsvText('');
      setShowImport(false);
    } catch {
      toast.error('Import failed');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Skip header row if it looks like a header
      const lines = text.split('\n');
      const firstLine = lines[0]?.toLowerCase() || '';
      if (firstLine.includes('name') || firstLine.includes('roll') || firstLine.includes('email')) {
        setCsvText(lines.slice(1).join('\n'));
      } else {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAssignPaper = async (assignmentId: string) => {
    try {
      await assignPaper(id, assignmentId);
      toast.success('Paper assigned to group!');
      setShowAssign(false);
    } catch {
      toast.error('Failed to assign paper');
    }
  };

  const filteredStudents = group.students.filter((s) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q);
  });

  // Assignments not yet assigned to this group
  const completedAssignments = assignments.filter((a) => a.status === 'completed');
  const assignedIds = new Set(group.assignedPapers.map((p) => p.assignmentId));
  const unassignedPapers = completedAssignments.filter((a) => !assignedIds.has(a._id));

  return (
    <div className={styles.detailPage}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/groups')}>
          ← Back to Groups
        </button>
        <div className={styles.headerMain}>
          <div className={styles.headerIcon} style={{ background: `${group.color}20` }}>
            {group.icon}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.headerTitle}>{group.name}</h1>
            <div className={styles.headerMeta}>
              {group.subject && <span className={styles.metaBadge} style={{ background: `${group.color}20`, color: group.color }}>{group.subject}</span>}
              {group.section && <span className={styles.metaBadge}>{group.section}</span>}
            </div>
            {group.description && <p className={styles.headerDesc}>{group.description}</p>}
          </div>
        </div>
        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{group.students.length}</span>
            <span className={styles.statLabel}>👤 Students</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{group.assignedPapers.length}</span>
            <span className={styles.statLabel}>📝 Assignments</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{group.updatedAt ? formatDate(group.updatedAt) : '—'}</span>
            <span className={styles.statLabel}>📅 Last Activity</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['students', 'assignments', 'performance'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
            style={tab === t ? { borderColor: group.color, color: group.color } : undefined}
          >
            {t === 'students' ? '👤 Students' : t === 'assignments' ? '📋 Assignments' : '📊 Performance'}
          </button>
        ))}
      </div>

      {/* ═══ STUDENTS TAB ═══ */}
      {tab === 'students' && (
        <div className={styles.tabContent}>
          <div className={styles.tabActions}>
            <input
              className={styles.tabSearch}
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <div className={styles.tabBtns}>
              <Button variant="secondary" size="sm" onClick={() => setShowImport(true)} icon={<span>📥</span>}>
                Import CSV
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowAddStudent(true)} icon={<span>+</span>}>
                Add Student
              </Button>
            </div>
          </div>

          {group.students.length === 0 ? (
            <div className={styles.tabEmpty}>
              <p className={styles.tabEmptyTitle}>No students yet</p>
              <p className={styles.tabEmptyDesc}>Add students manually or import from a CSV file.</p>
            </div>
          ) : (
            <div className={styles.studentList}>
              <div className={styles.studentHeader}>
                <span>#</span>
                <span>Name</span>
                <span>Email</span>
                <span>Roll No.</span>
                <span></span>
              </div>
              {filteredStudents.map((s, i) => (
                <div key={s._id} className={styles.studentRow}>
                  <span className={styles.studentIndex}>{i + 1}</span>
                  <span className={styles.studentName}>{s.name}</span>
                  <span className={styles.studentEmail}>{s.email || '—'}</span>
                  <span className={styles.studentRoll}>{s.rollNumber || '—'}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => {
                      if (confirm(`Remove ${s.name}?`)) removeStudent(id, s._id);
                    }}
                    title="Remove student"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ ASSIGNMENTS TAB ═══ */}
      {tab === 'assignments' && (
        <div className={styles.tabContent}>
          <div className={styles.tabActions}>
            <span className={styles.tabCount}>{group.assignedPapers.length} assigned papers</span>
            <Button variant="primary" size="sm" onClick={() => setShowAssign(true)} icon={<span>+</span>}>
              Assign Paper
            </Button>
          </div>

          {group.assignedPapers.length === 0 ? (
            <div className={styles.tabEmpty}>
              <p className={styles.tabEmptyTitle}>No assignments yet</p>
              <p className={styles.tabEmptyDesc}>Generate a question paper and assign it to this group.</p>
            </div>
          ) : (
            <div className={styles.paperList}>
              {group.assignedPapers.map((p) => (
                <div key={p.assignmentId} className={styles.paperRow}>
                  <div className={styles.paperIcon}>📝</div>
                  <div className={styles.paperInfo}>
                    <span className={styles.paperTitle}>{p.title}</span>
                    <span className={styles.paperMeta}>
                      Assigned: {formatDate(p.assignedAt)} · Due: {formatDate(p.dueDate)}
                    </span>
                  </div>
                  <div className={styles.paperActions}>
                    <button
                      className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`}
                      onClick={() => router.push(`/output/${p.assignmentId}`)}
                    >
                      View PDF
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => unassignPaper(id, p.assignmentId)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ PERFORMANCE TAB ═══ */}
      {tab === 'performance' && (
        <div className={styles.tabContent}>
          <div className={styles.performanceCard}>
            <h3 className={styles.perfTitle}>📊 Group Overview</h3>
            <div className={styles.perfGrid}>
              <div className={styles.perfStat}>
                <span className={styles.perfValue}>{group.students.length}</span>
                <span className={styles.perfLabel}>Total Students</span>
              </div>
              <div className={styles.perfStat}>
                <span className={styles.perfValue}>{group.assignedPapers.length}</span>
                <span className={styles.perfLabel}>Papers Assigned</span>
              </div>
              <div className={styles.perfStat}>
                <span className={styles.perfValue}>{group.students.filter((s) => s.email).length}</span>
                <span className={styles.perfLabel}>With Email</span>
              </div>
              <div className={styles.perfStat}>
                <span className={styles.perfValue}>{group.students.filter((s) => s.rollNumber).length}</span>
                <span className={styles.perfLabel}>With Roll No.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD STUDENT MODAL ═══ */}
      {showAddStudent && (
        <div className={compStyles.modalOverlay} onClick={() => setShowAddStudent(false)}>
          <div className={compStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={compStyles.modalTitle}>Add Student</h3>
            <div className={styles.modalForm}>
              <div>
                <label className={styles.modalLabel}>Name *</label>
                <input className={styles.modalInput} placeholder="Student name" value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: '100%' }} autoFocus />
              </div>
              <div>
                <label className={styles.modalLabel}>Email</label>
                <input className={styles.modalInput} placeholder="student@email.com" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} type="email" style={{ width: '100%' }} />
              </div>
              <div>
                <label className={styles.modalLabel}>Roll Number</label>
                <input className={styles.modalInput} placeholder="e.g. 12" value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
            <div className={compStyles.modalActions} style={{ marginTop: '20px' }}>
              <button className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`} onClick={() => setShowAddStudent(false)}>Cancel</button>
              <button className={`${compStyles.btn} ${compStyles.btnPrimary} ${compStyles.btnSm}`} onClick={handleAddStudent} disabled={!studentName.trim()}>Add Student</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CSV IMPORT MODAL ═══ */}
      {showImport && (
        <div className={compStyles.modalOverlay} onClick={() => setShowImport(false)}>
          <div className={compStyles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3 className={compStyles.modalTitle}>📥 Bulk Import Students</h3>
            <p className={styles.importHint}>
              Paste CSV data or upload a .csv file. Format: <strong>Name, Email, Roll Number</strong> (one per line)
            </p>
            <div className={styles.importExample}>
              <code>
                Rahul Sharma, rahul@gmail.com, 12<br />
                Priya Singh, priya@gmail.com, 13<br />
                Amit Kumar, amit@gmail.com, 14
              </code>
            </div>
            <div className={styles.importUpload}>
              <button className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`} onClick={() => fileRef.current?.click()}>
                📎 Upload CSV File
              </button>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
            <textarea
              className={styles.importTextarea}
              placeholder="Paste CSV data here...&#10;Name, Email, Roll Number&#10;Rahul, rahul@gmail.com, 12"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
            />
            {csvText.trim() && (
              <p className={styles.importPreview}>
                📋 {csvText.trim().split('\n').filter((l) => l.trim()).length} students detected
              </p>
            )}
            <div className={compStyles.modalActions} style={{ marginTop: '16px' }}>
              <button className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`} onClick={() => setShowImport(false)}>Cancel</button>
              <button className={`${compStyles.btn} ${compStyles.btnPrimary} ${compStyles.btnSm}`} onClick={handleCSVImport} disabled={!csvText.trim()}>
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ASSIGN PAPER MODAL ═══ */}
      {showAssign && (
        <div className={compStyles.modalOverlay} onClick={() => setShowAssign(false)}>
          <div className={compStyles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 className={compStyles.modalTitle}>Assign Paper to Group</h3>
            {unassignedPapers.length === 0 ? (
              <div className={styles.tabEmpty}>
                <p className={styles.tabEmptyTitle}>No papers available</p>
                <p className={styles.tabEmptyDesc}>Create and generate a question paper first, then assign it here.</p>
              </div>
            ) : (
              <div className={styles.assignList}>
                {unassignedPapers.map((a) => (
                  <div key={a._id} className={styles.assignRow} onClick={() => handleAssignPaper(a._id)}>
                    <div className={styles.assignInfo}>
                      <span className={styles.assignTitle}>{a.title}</span>
                      <span className={styles.assignMeta}>{a.subject} · {a.className} · {a.totalQuestions} Questions</span>
                    </div>
                    <span className={styles.assignBtn}>+ Assign</span>
                  </div>
                ))}
              </div>
            )}
            <div className={compStyles.modalActions} style={{ marginTop: '16px' }}>
              <button className={`${compStyles.btn} ${compStyles.btnSecondary} ${compStyles.btnSm}`} onClick={() => setShowAssign(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
