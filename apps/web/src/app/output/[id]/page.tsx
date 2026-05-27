'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import QuestionPaperView from '@/components/output/QuestionPaperView';
import Spinner from '@/components/ui/Spinner';
import styles from '@/styles/output.module.css';
import {
  joinAssignmentRoom,
  leaveAssignmentRoom,
  onGenerationProgress,
  onGenerationCompleted,
  onGenerationFailed,
} from '@/services/socket';
import toast from 'react-hot-toast';
import api from '@/services/api';

export default function OutputPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    currentPaper,
    fetchPaper,
    regenerate,
    generationStatus,
    generationProgress,
    generationMessage,
    setGenerationStatus,
    setCurrentPaper,
  } = useAssignmentStore();

  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // ✅ FIXED: Only fetch from API if NOT already generating
  // If generationStatus is 'generating', we just came from the create page
  // and the socket events will deliver the paper — hitting the API now
  // causes the race condition 404 error in production
  useEffect(() => {
    if (generationStatus !== 'generating') {
      fetchPaper(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // only re-run if assignment id changes

  // WebSocket connection
  useEffect(() => {
    joinAssignmentRoom(id);

    const offProgress = onGenerationProgress((data) => {
      if (data.assignmentId === id) {
        setGenerationStatus(
          data.status === 'processing' ? 'generating' : data.status as 'generating',
          data.progress,
          data.message
        );
      }
    });

    const offCompleted = onGenerationCompleted((data) => {
      if (data.assignmentId === id) {
        setGenerationStatus('completed', 100, 'Question paper generated!');
        if (data.paper) {
          // ✅ Paper arrives directly from socket — no extra API call needed
          setCurrentPaper(data.paper as Parameters<typeof setCurrentPaper>[0]);
        } else {
          // Fallback: socket sent completion but no paper attached
          fetchPaper(id);
        }
        toast.success('Question paper generated successfully!');
        setRegenerating(false);
      }
    });

    const offFailed = onGenerationFailed((data) => {
      if (data.assignmentId === id) {
        setGenerationStatus('failed', 0, data.message);
        toast.error(data.message || 'Generation failed');
        setRegenerating(false);
      }
    });

    return () => {
      leaveAssignmentRoom(id);
      offProgress();
      offCompleted();
      offFailed();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // only re-run if assignment id changes

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/assignments/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `question-paper-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  }, [id]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    await regenerate(id);
  }, [id, regenerate]);

  // Show progress if generating
  if (generationStatus === 'generating' || (!currentPaper && generationStatus !== 'failed')) {
    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressPercent}>{generationProgress}%</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${generationProgress}%` }} />
        </div>
        <p className={styles.progressText}>{generationMessage || 'Generating your question paper...'}</p>
        <Spinner size="sm" />
      </div>
    );
  }

  // Show error if failed
  if (generationStatus === 'failed') {
    return (
      <div className={styles.progressContainer}>
        <p style={{ fontSize: '48px' }}>❌</p>
        <p className={styles.progressText}>Generation failed. Please try again.</p>
        <button className={styles.regenBtn} onClick={handleRegenerate}>
          🔄 Retry Generation
        </button>
      </div>
    );
  }

  if (!currentPaper) {
    return <Spinner text="Loading question paper..." />;
  }

  return (
    <QuestionPaperView
      paper={currentPaper}
      onDownloadPdf={handleDownload}
      onRegenerate={handleRegenerate}
      downloading={downloading}
      regenerating={regenerating}
    />
  );
}