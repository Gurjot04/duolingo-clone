from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import (Achievement, LessonCompletion, User, UserAchievement, XpEvent)
from .clock import today_for


def metrics_for(db: Session, user: User) -> dict[str, int]:
    lessons = db.scalar(select(func.count(LessonCompletion.id)).where(LessonCompletion.user_id == user.id)) or 0
    perfect = db.scalar(select(func.count(LessonCompletion.id)).where(
        LessonCompletion.user_id == user.id, LessonCompletion.is_perfect.is_(True))) or 0
    goals = db.scalar(select(func.count()).select_from(
        select(XpEvent.day).where(XpEvent.user_id == user.id).group_by(XpEvent.day)
        .having(func.sum(XpEvent.amount) >= user.daily_goal_xp).subquery())) or 0
    return {"lessons": lessons, "streak": user.longest_streak, "xp": user.total_xp,
            "perfect": perfect, "goals": goals}


def unlock_new(db: Session, user: User) -> list[Achievement]:
    have = set(db.scalars(select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id)))
    m = metrics_for(db, user)
    unlocked = []
    for ach in db.scalars(select(Achievement)):
        if ach.id not in have and m.get(ach.metric, 0) >= ach.threshold:
            db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))
            unlocked.append(ach)
    db.flush()
    return unlocked


def daily_xp(db: Session, user: User) -> int:
    return db.scalar(select(func.coalesce(func.sum(XpEvent.amount), 0)).where(
        XpEvent.user_id == user.id, XpEvent.day == today_for(user))) or 0
