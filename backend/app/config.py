"""Central configuration (overridable via environment variables)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'duolingo.db'}")

MAX_HEARTS = 5
HEART_REGEN_SECONDS = int(os.getenv("HEART_REGEN_SECONDS", "1800"))  # 1 heart / 30 min
HEART_REFILL_GEM_COST = 350
LESSONS_PER_SKILL = 3

XP_PER_LESSON = 10
XP_PERFECT_BONUS = 5
GEMS_PER_LESSON = 5

DEFAULT_USERNAME = os.getenv("DEFAULT_USERNAME", "learner")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
