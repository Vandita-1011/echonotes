import { useState, useRef } from 'react';
import './UploadModal.css';

const ACCEPTED_TYPES = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac'];
const MAX_SIZE_MB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  if (!isOpen) return null;

  function validateFile(f) {
    if (!f) return 'Please select a file.';
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return `Unsupported file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`;
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_SIZE_MB} MB.`;
    }
    return '';
  }

  function handleFile(f) {
    const err = validateFile(f);
    setError(err);
    if (!err) setFile(f);
    else setFile(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await onUpload(file, title);
      setFile(null);
      setTitle('');
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleClose() {
    if (!uploading) {
      setFile(null);
      setTitle('');
      setError('');
      onClose();
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleClose}>
      <div className="modal-content glass-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Meeting Audio</h2>
          <button className="modal-close" onClick={handleClose} disabled={uploading} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${dragging ? 'drop-zone-active' : ''} ${file ? 'drop-zone-filled' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => handleFile(e.target.files[0])}
              hidden
            />
            {file ? (
              <div className="drop-zone-file">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <p className="drop-zone-filename">{file.name}</p>
                <p className="drop-zone-size">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="drop-zone-prompt">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Drag &amp; drop an audio file here</p>
                <p className="drop-zone-hint">or click to browse · MP3, WAV, M4A, OGG</p>
              </div>
            )}
          </div>

          <div className="modal-field">
            <label htmlFor="meeting-title">Meeting Title <span className="label-optional">(optional)</span></label>
            <input
              id="meeting-title"
              className="input"
              type="text"
              placeholder="e.g. Weekly Standup, Q3 Planning…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          {error && (
            <div className="modal-error animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--status-failed-text)">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 7.25a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0v2.5z" />
              </svg>
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={!file || uploading} id="submit-upload-btn">
              {uploading ? (
                <>
                  <span className="spinner" />
                  Processing…
                </>
              ) : (
                'Upload & Analyze'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
