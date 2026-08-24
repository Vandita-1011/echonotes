import logging

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Meeting
from app.schemas import DeleteResponse, MeetingResponse
from app.services.summarization import summarize_transcript
from app.services.transcription import transcribe_audio

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_UPLOAD_BYTES = settings.max_upload_bytes


@router.post("/upload", response_model=MeetingResponse)
async def upload_meeting(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(default=""),
    db: Session = Depends(get_db),
):
    """Upload an audio file, transcribe and summarize it, return the meeting record."""

    # ── Enforce upload size limit via Content-Length header ──
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum upload size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )

    # Read file bytes and double-check actual size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum upload size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB.",
        )

    filename = file.filename or "audio_upload"
    meeting_title = title.strip() if title.strip() else filename

    # ── Step 1: Create the meeting row ──
    meeting = Meeting(
        file_name=filename,
        title=meeting_title,
        status="PROCESSING",
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    try:
        # ── Step 2: Transcribe ──
        transcript = await transcribe_audio(file_bytes, filename)
        meeting.transcript = transcript

        # ── Step 3: Summarize ──
        result = await summarize_transcript(transcript)
        meeting.summary = result["summary"]
        meeting.key_decisions = result["keyDecisions"]
        meeting.action_items = result["actionItems"]

        # ── Step 4: Mark completed ──
        meeting.status = "COMPLETED"
        db.commit()
        db.refresh(meeting)
        logger.info("Meeting %d processed successfully", meeting.id)

    except Exception as exc:
        logger.exception("Processing failed for meeting %d", meeting.id)
        meeting.status = "FAILED"
        meeting.error_message = str(exc)[:2000]
        db.commit()
        db.refresh(meeting)

    return MeetingResponse.model_validate(meeting)


@router.get("", response_model=list[MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    """Return all meetings ordered by creation date (newest first)."""
    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).all()
    return [MeetingResponse.model_validate(m) for m in meetings]


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Return a single meeting by ID."""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting not found with id: {meeting_id}")
    return MeetingResponse.model_validate(meeting)


@router.delete("/{meeting_id}", response_model=DeleteResponse)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Delete a meeting by ID."""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting not found with id: {meeting_id}")
    db.delete(meeting)
    db.commit()
    return DeleteResponse(message=f"Meeting {meeting_id} deleted successfully")
