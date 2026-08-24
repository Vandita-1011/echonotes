import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a meeting-notes assistant. Given a raw meeting transcript, "
    "return ONLY a valid JSON object (no markdown, no extra text) with this "
    'exact shape: { "summary": "a concise 3-5 sentence summary of the meeting", '
    '"keyDecisions": ["decision 1", "decision 2"], '
    '"actionItems": [ { "task": "what needs to be done", '
    '"owner": "who is responsible, or Unassigned if unclear", '
    '"priority": "High, Medium, or Low" } ] }'
)


async def summarize_transcript(transcript: str) -> dict:
    """Send a transcript to Groq's chat completions endpoint and return structured meeting notes.

    Args:
        transcript: The full meeting transcript text.

    Returns:
        A dict with keys ``summary`` (str), ``keyDecisions`` (list[str]),
        and ``actionItems`` (list[dict]).

    Raises:
        httpx.HTTPStatusError: If the Groq API returns a non-2xx response.
        json.JSONDecodeError: If the response cannot be parsed as JSON.
        RuntimeError: If the parsed JSON is missing required fields.
    """
    url = f"{settings.groq_base_url}/chat/completions"
    timeout = httpx.Timeout(settings.groq_summarization_timeout, connect=10.0)

    payload = {
        "model": settings.summarization_model,
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Transcript:\n\n{transcript}"},
        ],
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)

    # Validate expected keys
    for key in ("summary", "keyDecisions", "actionItems"):
        if key not in parsed:
            raise RuntimeError(f"Groq summarization response missing required key: '{key}'")

    logger.info(
        "Summarization completed — %d decisions, %d action items",
        len(parsed["keyDecisions"]),
        len(parsed["actionItems"]),
    )
    return parsed
