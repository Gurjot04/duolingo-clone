from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..config import GEMS_PER_LESSON, XP_PERFECT_BONUS, XP_PER_LESSON
from ..database import get_db
from ..deps import current_user
from ..models import (Exercise, Lesson, LessonCompletion, Skill, User, UserSkillProgress, XpEvent)
from ..schemas import CheckRequest, CheckResponse, CompleteRequest
from ..serializers import user_summary
from ..services import achievements as ach_svc
from ..services import hearts as hearts_svc
from ..services import streak as streak_svc
from ..services.clock import today_for
from ..services.grading import check_answer, correct_answer_text
from ..services.path import skill_states

router = APIRouter(prefix="/api", tags=["lessons"])

# fields hidden from the client until the answer is checked
_HIDDEN = {"pairs"}


def _load_lesson(db: Session, lesson_id: int) -> Lesson:
    lesson = db.scalar(select(Lesson).where(Lesson.id == lesson_id).options(selectinload(Lesson.exercises),
                                                                            selectinload(Lesson.skill)))
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    return lesson


def _assert_unlocked(db: Session, user: User, lesson: Lesson) -> dict:
    state = skill_states(db, user).get(lesson.skill_id)
    if not state or state["status"] == "locked":
        raise HTTPException(403, "This skill is still locked")
    return state


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    lesson = _load_lesson(db, lesson_id)
    _assert_unlocked(db, user, lesson)
    if user.hearts <= 0:
        raise HTTPException(403, "out_of_hearts")
    db.commit()
    exercises = []
    for ex in lesson.exercises:
        data = dict(ex.data)
        if ex.type == "match_pairs":          # client matches pair-by-pair, server re-validates on check
            data.pop("pairs", None)
        exercises.append({"id": ex.id, "type": ex.type, "prompt": ex.prompt, "data": data})
    return {"id": lesson.id, "title": lesson.title, "skill_id": lesson.skill_id, "skill_title": lesson.skill.title,
            "level": lesson.order_index + 1, "exercises": exercises}


@router.post("/exercises/{exercise_id}/check", response_model=CheckResponse)
def check_exercise(exercise_id: int, body: CheckRequest, user: User = Depends(current_user),
                   db: Session = Depends(get_db)):
    ex = db.get(Exercise, exercise_id)
    if not ex:
        raise HTTPException(404, "Exercise not found")
    if user.hearts <= 0:
        raise HTTPException(403, "out_of_hearts")
    correct = check_answer(ex, body.answer)
    if not correct:
        hearts_svc.lose_heart(db, user)
    db.commit()
    return CheckResponse(correct=correct, correct_answer=correct_answer_text(ex), hearts=user.hearts,
                         out_of_hearts=user.hearts <= 0)


@router.post("/exercises/{exercise_id}/pair")
def check_pair(exercise_id: int, left: str, right: str, db: Session = Depends(get_db)):
    """Live feedback for one tap-pair in a match exercise (no heart is lost)."""
    ex = db.get(Exercise, exercise_id)
    if not ex or ex.type != "match_pairs":
        raise HTTPException(404, "Match exercise not found")
    return {"correct": [left, right] in ex.answer["pairs"]}


@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, body: CompleteRequest, user: User = Depends(current_user),
                    db: Session = Depends(get_db)):
    lesson = _load_lesson(db, lesson_id)
    state = _assert_unlocked(db, user, lesson)
    if user.hearts <= 0:
        raise HTTPException(403, "out_of_hearts")

    perfect = body.mistakes == 0
    xp = XP_PER_LESSON + (XP_PERFECT_BONUS if perfect else 0)
    today = today_for(user)
    before_goal = ach_svc.daily_xp(db, user)

    db.add(LessonCompletion(user_id=user.id, lesson_id=lesson.id, xp_earned=xp, mistakes=body.mistakes,
                            is_perfect=perfect))
    db.add(XpEvent(user_id=user.id, amount=xp, source="lesson", day=today))
    user.total_xp += xp
    user.gems += GEMS_PER_LESSON
    streak_extended = streak_svc.register_activity(user)

    # progress only moves when the learner finishes the *next* level (replays still earn XP)
    skill_done = False
    unlocked_skill = None
    if lesson.order_index == state["lessons_completed"]:
        prog = db.scalar(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id,
                                                         UserSkillProgress.skill_id == lesson.skill_id))
        if not prog:
            prog = UserSkillProgress(user_id=user.id, skill_id=lesson.skill_id, lessons_completed=0)
            db.add(prog)
        prog.lessons_completed += 1
        skill_done = prog.lessons_completed >= state["lessons_total"]
        if skill_done:
            db.flush()
            for sid, st in skill_states(db, user).items():
                if st["is_current"] and sid != lesson.skill_id:
                    unlocked_skill = db.get(Skill, sid).title
    db.flush()
    after_goal = ach_svc.daily_xp(db, user)
    new_ach = ach_svc.unlock_new(db, user)
    db.commit()

    return {
        "xp_earned": xp, "perfect": perfect, "gems_earned": GEMS_PER_LESSON,
        "streak_extended": streak_extended,
        "goal_reached_now": before_goal < user.daily_goal_xp <= after_goal,
        "skill_completed": skill_done, "unlocked_skill": unlocked_skill,
        "new_achievements": [{"code": a.code, "title": a.title, "icon": a.icon} for a in new_ach],
        "user": user_summary(db, user),
    }
