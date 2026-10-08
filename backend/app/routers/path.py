from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import current_user
from ..models import User
from ..services.path import build_path

router = APIRouter(prefix="/api", tags=["path"])


@router.get("/path")
def get_path(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return build_path(db, user)
