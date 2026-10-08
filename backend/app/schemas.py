"""Pydantic request / response models."""
from typing import Any

from pydantic import BaseModel, Field


class CheckRequest(BaseModel):
    answer: Any  # str for most types, list of [left, right] pairs for match_pairs


class CheckResponse(BaseModel):
    correct: bool
    correct_answer: str
    hearts: int
    out_of_hearts: bool


class CompleteRequest(BaseModel):
    mistakes: int = Field(ge=0, le=100)


class SettingsUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=32)
    daily_goal_xp: int | None = None


class RefillRequest(BaseModel):
    method: str = Field(pattern="^(gems|practice)$")


class AdvanceDayRequest(BaseModel):
    days: int = Field(default=1, ge=-30, le=30)
