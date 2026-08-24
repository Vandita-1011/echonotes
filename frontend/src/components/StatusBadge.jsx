import './StatusBadge.css';

const STATUS_MAP = {
  PROCESSING: { label: 'Processing', className: 'badge-processing' },
  COMPLETED:  { label: 'Completed',  className: 'badge-completed' },
  FAILED:     { label: 'Failed',     className: 'badge-failed' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.PROCESSING;
  return (
    <span className={`status-badge ${config.className}`}>
      {status === 'PROCESSING' && <span className="badge-dot" />}
      {config.label}
    </span>
  );
}
