import { useState, useEffect, useCallback } from 'react';
import MeetingCard from '../components/MeetingCard';
import UploadModal from '../components/UploadModal';
import { fetchMeetings, uploadMeeting, deleteMeeting } from '../api/meetings';
import './Dashboard.css';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');

  const loadMeetings = useCallback(async () => {
    try {
      setError('');
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (err) {
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  async function handleUpload(file, title) {
    await uploadMeeting(file, title);
    await loadMeetings();
  }

  async function handleDelete(id) {
    try {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete meeting');
    }
  }

  // Expose setShowUpload so Navbar can trigger it
  // We do this via window — simple, no prop drilling for a single global action
  useEffect(() => {
    window.__echonotesOpenUpload = () => setShowUpload(true);
    return () => { delete window.__echonotesOpenUpload; };
  }, []);

  return (
    <main className="dashboard container">
      <div className="dashboard-header animate-fade-in-up">
        <div>
          <h1 className="dashboard-title">Your Meetings</h1>
          <p className="dashboard-subtitle">
            {meetings.length
              ? `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''} recorded`
              : 'Upload your first meeting to get started'}
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowUpload(true)} id="dashboard-upload-btn">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 12V4M4 7l4-4 4 4" />
          </svg>
          New Upload
        </button>
      </div>

      {error && (
        <div className="dashboard-error animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--status-failed-text)">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 7.25a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0v2.5z" />
          </svg>
          {error}
          <button className="error-dismiss" onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="dashboard-empty animate-fade-in-up">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h2>No meetings yet</h2>
          <p>Upload an audio recording to transcribe and summarize it with AI.</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowUpload(true)}>
            Upload Your First Meeting
          </button>
        </div>
      ) : (
        <div className="meetings-grid">
          {meetings.map((m, i) => (
            <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />
    </main>
  );
}
