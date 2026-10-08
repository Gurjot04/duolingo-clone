"""Relational schema.

Content:   Course 1-* Unit 1-* Skill 1-* Lesson 1-* Exercise
Learner:   User 1-* UserSkillProgress / LessonCompletion / XpEvent / UserAchievement
Reference: Achievement (catalogue) *-* User via UserAchievement
"""
from datetime import date, datetime, timezone

from sqlalchemy import (JSON, Boolean, Date, DateTime, ForeignKey, Index, Integer,
                        String, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ---------------------------------------------------------------- content
class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    language_code: Mapped[str] = mapped_column(String(8), unique=True)
    name: Mapped[str] = mapped_column(String(64))
    from_language: Mapped[str] = mapped_column(String(32), default="English")
    units: Mapped[list["Unit"]] = relationship(back_populates="course", order_by="Unit.order_index",
                                               cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("course_id", "order_index"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(256))
    color: Mapped[str] = mapped_column(String(16), default="#58cc02")
    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list["Skill"]] = relationship(back_populates="unit", order_by="Skill.order_index",
                                                 cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("unit_id", "order_index"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(128))
    icon: Mapped[str] = mapped_column(String(16), default="star")
    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="skill", order_by="Lesson.order_index",
                                                   cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = (UniqueConstraint("skill_id", "order_index"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer)  # 0-based "level" within the skill
    title: Mapped[str] = mapped_column(String(128))
    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="lesson", order_by="Exercise.order_index",
                                                       cascade="all, delete-orphan")


class Exercise(Base):
    """`data` is what the learner sees; `answer` is the grading key (never sent to the client)."""
    __tablename__ = "exercises"
    __table_args__ = (UniqueConstraint("lesson_id", "order_index"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String(24))  # multiple_choice|translate|match_pairs|fill_blank|type_answer
    prompt: Mapped[str] = mapped_column(String(256))
    data: Mapped[dict] = mapped_column(JSON)
    answer: Mapped[dict] = mapped_column(JSON)
    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


# ---------------------------------------------------------------- learner
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    display_name: Mapped[str] = mapped_column(String(64))
    avatar_color: Mapped[str] = mapped_column(String(16), default="#1cb0f6")
    is_seeded_bot: Mapped[bool] = mapped_column(Boolean, default=False)
    course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id"), nullable=True)

    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=20)

    streak_count: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    hearts: Mapped[int] = mapped_column(Integer, default=5)
    hearts_updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    # testable day logic: "today" for this user = real today + offset
    day_offset: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)  # == crowns/levels earned
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class LessonCompletion(Base):
    """Immutable log of every finished lesson (replays included)."""
    __tablename__ = "lesson_completions"
    __table_args__ = (Index("ix_completion_user", "user_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"))
    xp_earned: Mapped[int] = mapped_column(Integer)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    is_perfect: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class XpEvent(Base):
    """Ledger of XP. `day` is the learner's (possibly simulated) calendar day, `created_at` is real time."""
    __tablename__ = "xp_events"
    __table_args__ = (Index("ix_xp_user_day", "user_id", "day"), Index("ix_xp_created", "created_at"))
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    amount: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(32), default="lesson")
    day: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Achievement(Base):
    __tablename__ = "achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(48), unique=True)
    title: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(String(160))
    icon: Mapped[str] = mapped_column(String(16))
    metric: Mapped[str] = mapped_column(String(32))  # lessons|streak|xp|perfect|goals
    threshold: Mapped[int] = mapped_column(Integer)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"))
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    achievement: Mapped[Achievement] = relationship()
