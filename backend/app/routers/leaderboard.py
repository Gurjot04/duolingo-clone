from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import User, XpEvent, utcnow

router = APIRouter(prefix="/api", tags=["leaderboard"])


@router.get("/leaderboard")
def leaderboard(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Weekly XP ranking (rolling 7 real days) across all learners, seeded bots included."""
    since = utcnow() - timedelta(days=7)
    weekly = dict(db.execute(select(XpEvent.user_id, func.sum(XpEvent.amount))
                             .where(XpEvent.created_at >= since).group_by(XpEvent.user_id)).all())
    rows = sorted(((u, int(weekly.get(u.id, 0))) for u in db.scalars(select(User))), key=lambda r: -r[1])
    return {"league": "Bronze League", "entries": [
        {"rank": i + 1, "user_id": u.id, "display_name": u.display_name, "avatar_color": u.avatar_color,
         "weekly_xp": xp, "is_me": u.id == user.id} for i, (u, xp) in enumerate(rows)]}
