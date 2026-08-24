# EchoNotes — AI Meeting Summarizer

Turn a raw meeting recording into a clean transcript, a concise summary, key
decisions, and a prioritized action item list — automatically, with no
manual note-taking required.

## The Problem

Meetings generate decisions and action items that are easy to lose track of.
Manual note-taking is distracting, inconsistent, and often incomplete —
important commitments get missed simply because no one wrote them down
clearly. EchoNotes removes that burden: upload the recording, and the app
handles transcription, summarization, and action item extraction for you.

## What I Built

EchoNotes is a full-stack web application with a Python backend and a
custom-designed React frontend. A user uploads a meeting audio file; the
backend transcribes the audio using Groq's hosted Whisper model, sends the
transcript to an LLM for structured summarization, and persists the results.
The frontend presents a dashboard of past meetings and a detailed view for
each one.

### Features

- 🎙️ Upload meeting audio (MP3, WAV, M4A, OGG, and other common formats)
- 📝 Automatic transcription via OpenAI's Whisper (`whisper-large-v3`),
  served through Groq
- ✨ AI-generated summary, key decisions, and action items (with owner and
  priority per task)
- 📋 Dashboard of all past meetings with live status tracking
  (Processing / Completed / Failed)
- 🔍 Full transcript viewer per meeting, with expand/collapse for long
  transcripts
- ⚠️ Graceful failure handling — a bad file or API issue results in a clear,
  readable error message on that meeting's card, not a crash
- 🔒 Upload size limit (100MB) enforced server-side

### Demo Video

📹 [Watch the demo](https://github.com/user-attachments/assets/b5c7ad21-3b64-4bfc-bf82-70ac68e5d014)

## Architecture & Workflow

```
frontend (React, :5173)  →  backend (FastAPI REST API, :8000)  →  Groq API
                                        ↓
                              SQLite database (local file)
```

**Flow:**

1. The user uploads an audio file through the React frontend.
2. The backend immediately creates a meeting record with status
   `PROCESSING` and saves it.
3. The backend sends the audio to Groq's Whisper API
   (`whisper-large-v3`) and receives a transcript.
4. The transcript is sent to Groq's LLM (`openai/gpt-oss-120b`) with a
   structured prompt, returning JSON containing a summary, key decisions,
   and action items.
5. On success, the meeting record is updated with all results and marked
   `COMPLETED`. On any failure at any step, the record is marked `FAILED`
   with a readable error message — the request never crashes.
6. Results are persisted to SQLite and returned to the frontend for
   display.

## Tech Stack

**Backend**
- Python 3
- FastAPI
- SQLAlchemy (ORM)
- SQLite (embedded, file-based — zero external setup required)
- Pydantic (request/response validation)
- `httpx` (async HTTP client for Groq API calls)
- Groq API — `whisper-large-v3` (transcription) + `openai/gpt-oss-120b`
  (summarization)

**Frontend**
- React (Vite)
- React Router
- Custom CSS design system (dark theme, glassmorphism, no CSS framework)

## Project Structure

```
echonotes/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint, CORS, startup
│   │   ├── config.py            # Environment/settings management
│   │   ├── database.py          # SQLAlchemy engine & session setup
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   └── meetings.py      # Upload, list, get, delete endpoints
│   │   └── services/
│   │       ├── transcription.py # Groq Whisper integration
│   │       └── summarization.py # Groq LLM integration + prompt
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx               # Routing
    │   ├── index.css             # Global design system
    │   ├── api/
    │   │   └── meetings.js       # Backend API client
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── UploadModal.jsx
    │   │   ├── MeetingCard.jsx
    │   │   └── StatusBadge.jsx
    │   └── pages/
    │       ├── Dashboard.jsx     # Meeting list + upload trigger
    │       └── MeetingDetail.jsx # Transcript, summary, decisions, actions
    ├── package.json
    └── .env.example
```

## Running Locally

### Prerequisites

- Python 3.10+ (developed and tested on 3.14)
- Node.js 18+
- A free Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

### 1. Backend

```bash
cd backend
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (copy `.env.example`) and set your Groq
key:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` (copy `.env.example` if present):

```
VITE_API_BASE_URL=http://localhost:8000/api/meetings
```

Start the frontend:

```bash
npm run dev
```

Runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/meetings/upload` | Upload an audio file (+ optional title), returns the processed meeting |
| GET | `/api/meetings` | List all meetings, newest first |
| GET | `/api/meetings/{id}` | Get one meeting's full details |
| DELETE | `/api/meetings/{id}` | Delete a meeting |

## Configuration Notes

- **`GROQ_API_KEY`** (required) — needed for both transcription and
  summarization. Get a free key at console.groq.com/keys.
- **Upload limit** — 100MB, enforced server-side; larger uploads are
  rejected with a `413` response before being sent to Groq.
- **Request timeouts** — both Groq API calls use a 120-second timeout to
  accommodate longer audio files.
- **Database** — SQLite file is created automatically on first run at
  `backend/data/echonotes.db`. No external database installation is
  required to evaluate this project.
- **CORS** — the backend allows requests from the frontend's local dev
  origin (`http://localhost:5173`) by default.
Author 
Vandita Duvvuru

https://github.com/user-attachments/assets/b5c7ad21-3b64-4bfc-bf82-70ac68e5d014

