from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ActionItemSchema(BaseModel):
    """A single action item extracted from a meeting."""

    task: str
    owner: str
    priority: str


class MeetingResponse(BaseModel):
    """Public-facing meeting representation with camelCase JSON keys."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    id: int
    file_name: str = Field(alias="fileName")
    title: str
    status: str
    transcript: str | None = None
    summary: str | None = None
    key_decisions: list[str] | None = Field(default=None, alias="keyDecisions")
    action_items: list[ActionItemSchema] | None = Field(default=None, alias="actionItems")
    error_message: str | None = Field(default=None, alias="errorMessage")
    created_at: datetime = Field(alias="createdAt")


class DeleteResponse(BaseModel):
    """Response body for a successful delete."""

    message: str
