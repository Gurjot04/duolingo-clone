"""Developer helpers so streak / heart logic can be demonstrated without waiting real days."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..config import MAX_HEARTS
from ..database import get_db
from ..deps import current_user
from ..models import User, utcnow
from ..schemas import AdvanceDayRequest
from ..serializers import user_summary

router = APIRouter(prefix="/api/dev", tags=["dev"])


@router.post("/advance-day")
def advance_day(body: AdvanceDayRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.day_offset += body.days
    db.commit()
    return user_summary(db, user)


@router.post("/reset-hearts")
def set_hearts(hearts: int = 0, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.hearts = max(0, min(MAX_HEARTS, hearts))
    user.hearts_updated_at = utcnow()
    db.commit()
    return user_summary(db, user)
