from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    groq_api_key: str = ""

    # Groq API
    groq_base_url: str = "https://api.groq.com/openai/v1"
    transcription_model: str = "whisper-large-v3"
    summarization_model: str = "openai/gpt-oss-120b"

    # Upload constraints
    max_upload_bytes: int = 100 * 1024 * 1024  # 100 MB

    # Timeouts (seconds) for Groq API calls
    groq_transcription_timeout: float = 120.0
    groq_summarization_timeout: float = 120.0

    # Database
    database_dir: Path = Path(__file__).resolve().parent.parent / "data"
    database_name: str = "echonotes.db"

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.database_dir / self.database_name}"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
