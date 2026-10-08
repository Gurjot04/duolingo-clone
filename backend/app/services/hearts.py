"""Hearts: lose one per wrong answer, regenerate lazily over time, or refill (gems / practice)."""
from datetime import timedelta

from sqlalchemy.orm import Session

from ..config import HEART_REFILL_GEM_COST, HEART_REGEN_SECONDS, MAX_HEARTS
from ..models import User, utcnow


class NotEnoughGems(Exception):
    pass


def sync_hearts(user: User) -> None:
    """Apply any regeneration earned since `hearts_updated_at` (idempotent, call before reading hearts)."""
    now = utcnow()
    if user.hearts >= MAX_HEARTS:
        user.hearts = MAX_HEARTS
        user.hearts_updated_at = now
        return
    gained = int((now - user.hearts_updated_at).total_seconds() // HEART_REGEN_SECONDS)
    if gained > 0:
        user.hearts = min(MAX_HEARTS, user.hearts + gained)
        user.hearts_updated_at = now if user.hearts >= MAX_HEARTS else (
            user.hearts_updated_at + timedelta(seconds=gained * HEART_REGEN_SECONDS))


def seconds_to_next_heart(user: User) -> int | None:
    if user.hearts >= MAX_HEARTS:
        return None
    elapsed = (utcnow() - user.hearts_updated_at).total_seconds()
    return max(0, int(HEART_REGEN_SECONDS - elapsed))


def lose_heart(db: Session, user: User) -> int:
    sync_hearts(user)
    if user.hearts == MAX_HEARTS:           # regen timer starts when we drop below max
        user.hearts_updated_at = utcnow()
    user.hearts = max(0, user.hearts - 1)
    db.flush()
    return user.hearts


def refill_with_gems(db: Session, user: User) -> None:
    sync_hearts(user)
    if user.gems < HEART_REFILL_GEM_COST:
        raise NotEnoughGems()
    user.gems -= HEART_REFILL_GEM_COST
    user.hearts = MAX_HEARTS
    user.hearts_updated_at = utcnow()
    db.flush()


def gain_heart_from_practice(db: Session, user: User) -> None:
    sync_hearts(user)
    user.hearts = min(MAX_HEARTS, user.hearts + 1)
    user.hearts_updated_at = utcnow()
    db.flush()
