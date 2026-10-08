from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import MAX_HEARTS
from ..database import get_db
from ..deps import current_user
from ..models import Achievement, LessonCompletion, User, UserAchievement
from ..schemas import RefillRequest, SettingsUpdate
from ..serializers import user_summary
from ..services import hearts as hearts_svc

router = APIRouter(prefix="/api/users/me", tags=["learner"])
GOAL_OPTIONS = (10, 20, 30, 50)


@router.get("")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.commit()  # persists lazily-regenerated hearts
    return user_summary(db, user)


@router.patch("")
def update_settings(body: SettingsUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if body.daily_goal_xp is not None:
        if body.daily_goal_xp not in GOAL_OPTIONS:
            raise HTTPException(422, f"daily_goal_xp must be one of {GOAL_OPTIONS}")
        user.daily_goal_xp = body.daily_goal_xp
    if body.display_name is not None:
        user.display_name = body.display_name.strip()
    db.commit()
    return user_summary(db, user)


@router.post("/hearts/refill")
def refill_hearts(body: RefillRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if user.hearts >= MAX_HEARTS:
        raise HTTPException(409, "Hearts are already full")
    if body.method == "gems":
        try:
            hearts_svc.refill_with_gems(db, user)
        except hearts_svc.NotEnoughGems:
            raise HTTPException(402, "Not enough gems")
    else:  # mocked "practice to earn a heart"
        hearts_svc.gain_heart_from_practice(db, user)
    db.commit()
    return user_summary(db, user)


@router.get("/profile")
def profile(user: User = Depends(current_user), db: Session = Depends(get_db)):
    lessons = db.scalar(select(func.count(LessonCompletion.id)).where(LessonCompletion.user_id == user.id)) or 0
    unlocked = {ua.achievement_id: ua.unlocked_at for ua in
                db.scalars(select(UserAchievement).where(UserAchievement.user_id == user.id))}
    achievements = [{
        "code": a.code, "title": a.title, "description": a.description, "icon": a.icon,
        "unlocked": a.id in unlocked, "unlocked_at": unlocked[a.id].isoformat() if a.id in unlocked else None,
        "metric": a.metric, "threshold": a.threshold,
    } for a in db.scalars(select(Achievement).order_by(Achievement.id))]
    return {**user_summary(db, user), "joined": user.created_at.isoformat(), "longest_streak": user.longest_streak,
            "lessons_completed": lessons, "achievements": achievements}
