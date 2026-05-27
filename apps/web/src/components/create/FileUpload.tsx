'use client';

import React, { useRef, useState, useCallback } from 'react';
import styles from '@/styles/create.module.css';
import { useFormStore } from '@/store/useFormStore';
import { cn } from '@/lib/utils';

export default function FileUpload() {
  const { uploadedFile, uploadedFileName, setField } = useFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const maxSize = 10 * 1024 * 1024;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('Invalid file type. Only PDF, PNG, and JPEG are allowed.');
      return;
    }
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    setField('uploadedFile', file);
    setField('uploadedFileName', file.name);
  }, [setField]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeFile = () => {
    setField('uploadedFile', null);
    setField('uploadedFileName', '');
  };

  if (uploadedFile || uploadedFileName) {
    return (
      <div>
        <div className={styles.filePreview}>
          <span className={styles.fileName}>📄 {uploadedFileName}</span>
          <button className={styles.fileRemove} onClick={removeFile}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(styles.uploadZone, dragging && styles.uploadZoneDrag)}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className={styles.uploadIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <span className={styles.uploadText}>Choose a file or drag &amp; drop it here</span>
        <span className={styles.uploadHint}>JPEG, PNG, upto 10MB</span>
        <span className={styles.browseBtn}>Browse Files</span>
      </div>
      <p className={styles.uploadHelper}>Upload images of your preferred document/image</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
