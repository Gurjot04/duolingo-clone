from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import DEFAULT_USERNAME
from .database import get_db
from .models import User
from .services.hearts import sync_hearts


def current_user(db: Session = Depends(get_db)) -> User:
    """Authentication is simplified: every request acts as the default seeded learner."""
    user = db.scalar(select(User).where(User.username == DEFAULT_USERNAME))
    if not user:
        raise HTTPException(500, "Database not seeded. Run `python -m app.seed`.")
    sync_hearts(user)
    return user
