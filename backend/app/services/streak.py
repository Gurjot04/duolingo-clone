from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import User, XpEvent
from .clock import today_for


def effective_streak(user: User) -> int:
    """Streak shown in the UI: it silently breaks if a whole day was skipped."""
    if not user.last_active_date:
        return 0
    gap = (today_for(user) - user.last_active_date).days
    return user.streak_count if gap <= 1 else 0


def practiced_today(user: User) -> bool:
    return user.last_active_date == today_for(user)


def register_activity(user: User) -> bool:
    """Call when a lesson is finished. Returns True if the streak was extended today."""
    today = today_for(user)
    if user.last_active_date == today:
        return False
    if user.last_active_date and (today - user.last_active_date).days == 1:
        user.streak_count += 1
    else:
        user.streak_count = 1
    user.last_active_date = today
    user.longest_streak = max(user.longest_streak, user.streak_count)
    return True


def week_activity(db: Session, user: User) -> list[dict]:
    """Last 7 days (oldest first) with whether the learner earned XP that day."""
    today = today_for(user)
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    active = set(db.scalars(select(XpEvent.day).where(XpEvent.user_id == user.id, XpEvent.day >= days[0])))
    return [{"date": d.isoformat(), "weekday": d.strftime("%a")[0], "active": d in active,
             "is_today": d == today} for d in days]
