"""Builds the learning path with lock / available / completed state per skill."""
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import Course, Skill, Unit, User, UserSkillProgress


def skill_states(db: Session, user: User) -> dict[int, dict]:
    """Ordered across the whole course: a skill unlocks once the previous one is fully completed."""
    skills = db.scalars(
        select(Skill).join(Unit).where(Unit.course_id == user.course_id)
        .order_by(Unit.order_index, Skill.order_index).options(selectinload(Skill.lessons))).all()
    done = {p.skill_id: p.lessons_completed for p in
            db.scalars(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))}
    states, prev_complete, current_marked = {}, True, False
    for s in skills:
        total, completed = len(s.lessons), done.get(s.id, 0)
        if not prev_complete:
            status = "locked"
        elif completed >= total:
            status = "completed"
        else:
            status = "available"
        is_current = status == "available" and not current_marked
        current_marked = current_marked or is_current
        next_lesson = s.lessons[completed].id if completed < total else s.lessons[0].id
        states[s.id] = {"status": status, "lessons_completed": completed, "lessons_total": total,
                        "next_lesson_id": next_lesson, "is_current": is_current}
        prev_complete = completed >= total
    return states


def build_path(db: Session, user: User) -> dict:
    course = db.get(Course, user.course_id)
    states = skill_states(db, user)
    units = db.scalars(select(Unit).where(Unit.course_id == course.id).order_by(Unit.order_index)
                       .options(selectinload(Unit.skills))).all()
    return {
        "course": {"id": course.id, "name": course.name, "language_code": course.language_code},
        "units": [{
            "id": u.id, "title": u.title, "description": u.description, "color": u.color,
            "order_index": u.order_index,
            "skills": [{"id": s.id, "title": s.title, "icon": s.icon, **states[s.id]} for s in u.skills],
        } for u in units],
    }
