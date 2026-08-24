import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import './MeetingCard.css';

export default function MeetingCard({ meeting, onDelete, index = 0 }) {
  const navigate = useNavigate();

  const createdDate = new Date(meeting.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const createdTime = new Date(meeting.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  function handleClick() {
    navigate(`/meetings/${meeting.id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${meeting.title}"? This cannot be undone.`)) {
      onDelete(meeting.id);
    }
  }

  return (
    <article
      className="meeting-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handleClick}
      id={`meeting-card-${meeting.id}`}
    >
      <div className="card-top">
        <StatusBadge status={meeting.status} />
        <button
          className="card-delete"
          onClick={handleDelete}
          aria-label={`Delete ${meeting.title}`}
          title="Delete meeting"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
          </svg>
        </button>
      </div>

      <h3 className="card-title">{meeting.title}</h3>

      {meeting.summary && (
        <p className="card-summary">{meeting.summary.slice(0, 120)}…</p>
      )}

      {meeting.status === 'FAILED' && meeting.errorMessage && (
        <p className="card-error">{meeting.errorMessage.slice(0, 100)}</p>
      )}

      <div className="card-footer">
        <span className="card-date">{createdDate} · {createdTime}</span>
        <span className="card-arrow">→</span>
      </div>
    </article>
  );
}
