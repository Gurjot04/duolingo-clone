"""Idempotent database seeding: course content, achievements, bot learners and the default learner."""
import random
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import content
from .config import DEFAULT_USERNAME, LESSONS_PER_SKILL
from .database import Base, SessionLocal, engine
from .models import (Achievement, Course, Exercise, Lesson, LessonCompletion, Skill, Unit, User,
                     UserAchievement, UserSkillProgress, XpEvent, utcnow)
from .services.clock import today_for


# ---------------------------------------------------------------- exercise builders
def _norm_tokens(sentence: str) -> list[str]:
    return sentence.replace(",", "").replace("¡", "").replace("!", "").split()


def _mc(rng, words, i, es_to_en):
    es, en = words[i % len(words)]
    pool = [w for w in words if w[0] != es and w[1] != en]
    wrong = rng.sample(pool, 2)
    if es_to_en:
        opts = [en] + [w[1] for w in wrong]
        prompt, shown, ans = "What does this mean?", es, en
    else:
        opts = [es] + [w[0] for w in wrong]
        prompt, shown, ans = f"Which of these is “{en}”?", en, es
    rng.shuffle(opts)
    return "multiple_choice", prompt, {"options": opts, "speak": es, "shown": shown, "es_to_en": es_to_en}, {"answer": ans}


def _match(rng, words, i):
    pairs = [words[(i + k) % len(words)] for k in range(5)]
    left, right = [p[0] for p in pairs], [p[1] for p in pairs]
    rng.shuffle(left)
    rng.shuffle(right)
    return "match_pairs", "Tap the matching pairs", {"left": left, "right": right,
                                                     "pairs": [list(p) for p in pairs]}, {"pairs": [list(p) for p in pairs]}


def _translate(rng, phrase, es_to_en):
    es, en, extra_es, extra_en = phrase
    src, tgt, extra = (es, en, extra_en) if es_to_en else (en, es, extra_es)
    bank = _norm_tokens(tgt) + extra
    rng.shuffle(bank)
    prompt = "Translate this sentence"
    return "translate", prompt, {"source": src, "bank": bank, "speak": es, "es_to_en": es_to_en}, {"answer": tgt}


def _fill(blank):
    sentence, answer, options = blank
    opts = list(options)
    random.Random(sentence).shuffle(opts)
    return "fill_blank", "Select the missing word", {"sentence": sentence, "options": opts}, {"answer": answer}


def _type(words_or_phrase, es_to_en=False):
    es, en = words_or_phrase[0], words_or_phrase[1]
    if es_to_en:
        return "type_answer", "Type in English", {"source": es, "speak": es, "target_lang": "English"}, {"answer": en}
    return "type_answer", "Type in Spanish", {"source": en, "speak": es, "target_lang": "Spanish"}, {"answer": es}


def build_lesson_exercises(skill: dict, level: int, seed: int) -> list[tuple]:
    """10 exercises mixing all five types; rotated by `level` so replays feel fresh."""
    rng = random.Random(seed * 31 + level)
    w, p, b = skill["words"], skill["phrases"], skill["blanks"]
    o = level * 2
    return [
        _mc(rng, w, o, es_to_en=False),
        _mc(rng, w, o + 1, es_to_en=True),
        _match(rng, w, o),
        _translate(rng, p[level % len(p)], es_to_en=True),
        _fill(b[level % len(b)]),
        _mc(rng, w, o + 2, es_to_en=False),
        _translate(rng, p[(level + 1) % len(p)], es_to_en=False),
        _type(w[(o + 3) % len(w)]),
        _fill(b[(level + 1) % len(b)]),
        _type(p[(level + 2) % len(p)][:2]),
    ]


# ---------------------------------------------------------------- seeding steps
def seed_course(db: Session) -> Course:
    course = db.scalar(select(Course).where(Course.language_code == content.COURSE["language_code"]))
    if course:
        return course
    course = Course(**content.COURSE)
    db.add(course)
    skill_seed = 0
    for u_idx, u in enumerate(content.UNITS):
        unit = Unit(order_index=u_idx, title=u["title"], description=u["description"], color=u["color"])
        course.units.append(unit)
        for s_idx, s in enumerate(u["skills"]):
            skill_seed += 1
            skill = Skill(order_index=s_idx, title=s["title"], icon=s["icon"])
            unit.skills.append(skill)
            for level in range(LESSONS_PER_SKILL):
                lesson = Lesson(order_index=level, title=f"{s['title']} – Level {level + 1}")
                skill.lessons.append(lesson)
                for e_idx, (etype, prompt, data, answer) in enumerate(build_lesson_exercises(s, level, skill_seed)):
                    lesson.exercises.append(Exercise(order_index=e_idx, type=etype, prompt=prompt,
                                                     data=data, answer=answer))
    db.flush()
    return course


def seed_achievements(db: Session) -> None:
    existing = {a.code for a in db.scalars(select(Achievement))}
    for code, title, desc, icon, metric, threshold in content.ACHIEVEMENTS:
        if code not in existing:
            db.add(Achievement(code=code, title=title, description=desc, icon=icon, metric=metric,
                               threshold=threshold))
    db.flush()


def seed_bots(db: Session, course: Course) -> None:
    if db.scalar(select(User).where(User.is_seeded_bot.is_(True))):
        return
    rng = random.Random(7)
    for username, name, color, weekly, total in content.BOT_LEARNERS:
        user = User(username=username, display_name=name, avatar_color=color, is_seeded_bot=True,
                    course_id=course.id, total_xp=total, streak_count=rng.randint(1, 30))
        db.add(user)
        db.flush()
        # spread this week's XP over the last 7 real days so the weekly leaderboard is computable
        remaining = weekly
        for d in range(6, -1, -1):
            amount = remaining if d == 0 else min(remaining, rng.randint(0, weekly // 4))
            remaining -= amount
            if amount:
                day = today_for(user) - timedelta(days=d)
                db.add(XpEvent(user_id=user.id, amount=amount, source="seed", day=day,
                               created_at=utcnow() - timedelta(days=d, hours=1)))


def seed_default_learner(db: Session, course: Course) -> None:
    if db.scalar(select(User).where(User.username == DEFAULT_USERNAME)):
        return
    user = User(username=DEFAULT_USERNAME, display_name="Learner", avatar_color="#1cb0f6", course_id=course.id,
                total_xp=0, gems=500, daily_goal_xp=20, hearts=5)
    db.add(user)
    db.flush()

    skills = [s for u in course.units for s in u.skills]
    # Basics & Introductions fully done, People started -> Unit 1 nearly complete
    plan = [(skills[0], 3), (skills[1], 3), (skills[2], 1)]
    day0 = today_for(user)
    day_cursor = 0
    for skill, done in plan:
        db.add(UserSkillProgress(user_id=user.id, skill_id=skill.id, lessons_completed=done))
        for lesson in skill.lessons[:done]:
            perfect = lesson.order_index != 1
            xp = 15 if perfect else 10
            when = utcnow() - timedelta(days=max(0, 4 - day_cursor // 2))
            db.add(LessonCompletion(user_id=user.id, lesson_id=lesson.id, xp_earned=xp,
                                    mistakes=0 if perfect else 2, is_perfect=perfect, completed_at=when))
            day_cursor += 1
    # XP ledger for the last 4 days (so the streak week view has data), yesterday included
    split = {4: 25, 3: 30, 2: 20, 1: 35}
    user.total_xp = sum(split.values())
    for ago, amount in split.items():
        db.add(XpEvent(user_id=user.id, amount=amount, source="lesson", day=day0 - timedelta(days=ago),
                       created_at=utcnow() - timedelta(days=ago)))
    user.streak_count = 4
    user.longest_streak = 4
    user.last_active_date = day0 - timedelta(days=1)  # streak "at risk" until today's first lesson
    db.flush()
    for code in ("first_lesson", "streak_3", "xp_100", "perfect_1"):
        ach = db.scalar(select(Achievement).where(Achievement.code == code))
        db.add(UserAchievement(user_id=user.id, achievement_id=ach.id))


def seed_all(db: Session) -> None:
    course = seed_course(db)
    seed_achievements(db)
    seed_bots(db, course)
    seed_default_learner(db, course)
    db.commit()


def init_db(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_all(db)


if __name__ == "__main__":
    import sys
    init_db(reset="--reset" in sys.argv)
    print("Database seeded.")
