import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    """Send an audio file to Groq's Whisper endpoint and return the transcript text.

    Args:
        file_bytes: Raw bytes of the uploaded audio file.
        filename: Original filename (used for the multipart Content-Disposition).

    Returns:
        The transcribed text.

    Raises:
        httpx.HTTPStatusError: If the Groq API returns a non-2xx response.
        RuntimeError: If the response is missing the expected 'text' field.
    """
    url = f"{settings.groq_base_url}/audio/transcriptions"
    timeout = httpx.Timeout(settings.groq_transcription_timeout, connect=10.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            url,
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            files={"file": (filename, file_bytes)},
            data={
                "model": settings.transcription_model,
                "response_format": "json",
            },
        )
        response.raise_for_status()

    data = response.json()
    text = data.get("text")
    if not text:
        raise RuntimeError("Groq transcription response did not contain a 'text' field.")

    logger.info("Transcription completed — %d characters", len(text))
    return text
