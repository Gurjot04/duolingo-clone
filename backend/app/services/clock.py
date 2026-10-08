"""Testable 'today': each learner has a day offset that the dev endpoint can advance."""
from datetime import date, timedelta

from ..models import User


def today_for(user: User) -> date:
    return date.today() + timedelta(days=user.day_offset or 0)
