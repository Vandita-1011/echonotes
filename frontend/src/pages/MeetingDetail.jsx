import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { fetchMeeting, deleteMeeting } from '../api/meetings';
import './MeetingDetail.css';

const PRIORITY_CLASSES = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMeeting(id);
        setMeeting(data);
      } catch (err) {
        setError(err.message || 'Failed to load meeting');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${meeting.title}"? This cannot be undone.`)) return;
    try {
      await deleteMeeting(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete meeting');
    }
  }

  if (loading) {
    return (
      <main className="detail container">
        <div className="detail-skeleton">
          <div className="skeleton-bar skeleton-title" />
          <div className="skeleton-bar skeleton-meta" />
          <div className="skeleton-block" />
          <div className="skeleton-block skeleton-short" />
        </div>
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main className="detail container">
        <div className="detail-error animate-fade-in-up">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--status-failed-text)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <h2>{error || 'Meeting not found'}</h2>
          <Link to="/" className="btn btn-ghost">← Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  const createdDate = new Date(meeting.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const createdTime = new Date(meeting.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="detail container">
      {/* Back + Actions */}
      <div className="detail-nav animate-fade-in">
        <Link to="/" className="detail-back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Dashboard
        </Link>
        <button className="btn btn-danger btn-sm" onClick={handleDelete} id="detail-delete-btn">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
          </svg>
          Delete
        </button>
      </div>

      {/* Header */}
      <header className="detail-header animate-fade-in-up">
        <div className="detail-meta">
          <StatusBadge status={meeting.status} />
          <span className="detail-date">{createdDate} · {createdTime}</span>
        </div>
        <h1 className="detail-title">{meeting.title}</h1>
        <p className="detail-filename">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          {meeting.fileName}
        </p>
      </header>

      {/* Failed Error */}
      {meeting.status === 'FAILED' && meeting.errorMessage && (
        <section className="detail-section detail-failed-section animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="failed-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div>
              <strong>Processing Failed</strong>
              <p>{meeting.errorMessage}</p>
            </div>
          </div>
        </section>
      )}

      {/* Summary */}
      {meeting.summary && (
        <section className="detail-section glass-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Summary
          </h2>
          <p className="section-body">{meeting.summary}</p>
        </section>
      )}

      {/* Key Decisions */}
      {meeting.keyDecisions && meeting.keyDecisions.length > 0 && (
        <section className="detail-section glass-card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Key Decisions
          </h2>
          <ul className="decisions-list">
            {meeting.keyDecisions.map((d, i) => (
              <li key={i} className="decision-item">
                <span className="decision-bullet" />
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Items */}
      {meeting.actionItems && meeting.actionItems.length > 0 && (
        <section className="detail-section glass-card animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-completed-text)" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Action Items
          </h2>
          <div className="action-items-table-wrap">
            <table className="action-items-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Owner</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {meeting.actionItems.map((item, i) => (
                  <tr key={i}>
                    <td>{item.task}</td>
                    <td>
                      <span className="owner-chip">{item.owner}</span>
                    </td>
                    <td>
                      <span className={`priority-pill ${PRIORITY_CLASSES[item.priority] || ''}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Transcript */}
      {meeting.transcript && (
        <section className="detail-section glass-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="section-title-row">
            <h2 className="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Transcript
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setTranscriptExpanded(!transcriptExpanded)}
            >
              {transcriptExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <div className={`transcript-body ${transcriptExpanded ? 'transcript-expanded' : ''}`}>
            <p>{meeting.transcript}</p>
          </div>
          {!transcriptExpanded && meeting.transcript.length > 500 && (
            <div className="transcript-fade" />
          )}
        </section>
      )}
    </main>
  );
}
