import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ onUploadClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" stroke="url(#navGrad)" strokeWidth="2.5" />
              <path d="M10 9L19 14L10 19V9Z" fill="url(#navGrad)" />
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="navbar-title">EchoNotes</span>
        </Link>

        <button className="btn btn-primary" onClick={onUploadClick} id="nav-upload-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 12V4M4 7l4-4 4 4" />
          </svg>
          Upload
        </button>
      </div>
    </nav>
  );
}
