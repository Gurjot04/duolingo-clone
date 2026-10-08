from sqlalchemy.orm import Session

from .config import HEART_REFILL_GEM_COST, HEART_REGEN_SECONDS, MAX_HEARTS
from .models import User
from .services import streak as streak_svc
from .services.achievements import daily_xp
from .services.clock import today_for
from .services.hearts import seconds_to_next_heart


def user_summary(db: Session, user: User) -> dict:
    """The data behind the top bar: streak, XP, hearts, gems, daily goal."""
    today_xp = daily_xp(db, user)
    return {
        "id": user.id, "username": user.username, "display_name": user.display_name,
        "avatar_color": user.avatar_color,
        "total_xp": user.total_xp, "gems": user.gems,
        "streak": streak_svc.effective_streak(user), "practiced_today": streak_svc.practiced_today(user),
        "hearts": user.hearts, "max_hearts": MAX_HEARTS,
        "next_heart_in_seconds": seconds_to_next_heart(user),
        "heart_regen_seconds": HEART_REGEN_SECONDS, "heart_refill_cost": HEART_REFILL_GEM_COST,
        "daily_goal_xp": user.daily_goal_xp, "daily_xp": today_xp,
        "today": today_for(user).isoformat(),
        "week": streak_svc.week_activity(db, user),
    }
