# Duolingo clone – a Duolingo-style learning app

A full-stack clone of the Duolingo web experience: a skill path with lock/unlock progression, a lesson player with five exercise types, and the gamification loop (XP, streak, hearts, daily goal, leaderboard, achievements). All progress is persisted per learner.

> The mascot is an original frog ("Ribbit"), drawn as SVG – no Duolingo characters or assets are used.

- **Frontend:** Next.js 15 (App Router) + TypeScript, plain CSS
- **Backend:** Python 3.12+ / FastAPI + SQLAlchemy 2
- **Database:** SQLite (file created and seeded automatically on first boot)

---

## Quick start

### 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
On first start the tables are created and seeded (Spanish course, achievements, 11 leaderboard learners, and a default learner with progress). Interactive API docs: <http://localhost:8000/docs>.

Re-seed from scratch: `python -m app.seed --reset`. Run tests: `pip install -r requirements-dev.txt && pytest`.

### 2. Frontend
```bash
cd frontend
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                        # http://localhost:3000
```

### Environment variables
| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000` | Base URL of the API |
| `DATABASE_URL` | backend | `sqlite:///backend/duolingo.db` | SQLAlchemy URL |
| `CORS_ORIGINS` | backend | `*` | Comma-separated allowed origins |
| `HEART_REGEN_SECONDS` | backend | `1800` | Seconds to regenerate one heart |

---

## Features

| Area | What is implemented |
|---|---|
| Learning path | 3 units × 3 skills, winding path, **locked / available / completed** states, progress ring + crown count per skill, "START" bubble and skill popover, sticky unit header |
| Top bar | Streak (with 7-day week popover), gems (mocked), hearts (with regen countdown and refill options), course switcher placeholder |
| Lesson player | 10 exercises per lesson, 3 levels per skill. Types: **multiple choice, translate (word bank), match pairs, fill in the blank, type the answer** (with Spanish accent keys) |
| Feedback | Green/red slide-up feedback bar showing the correct solution, shake animation, sound effects, text-to-speech (browser TTS), keyboard shortcuts (Enter, 1-3), wrong answers re-queued at the end, animated progress bar |
| Hearts | −1 per wrong answer (saved server-side), lazy time-based regeneration, "out of hearts" modal with practice (+1) / gem refill / Super placeholder |
| Completion | Confetti screen with XP / accuracy / time cards, streak celebration screen, daily-goal and unlock banners, achievement toasts |
| Gamification | XP ledger, streak with day logic, daily goal (10/20/30/50 XP, changeable in Settings), weekly leaderboard, 8 achievements |
| Profile / Settings | Stats, achievements grid, daily goal, display name, **testing tools** to simulate days / hearts |
| Placeholders | Shop, Quests, Super, guidebook, friends, extra languages, speech exercises → "Coming soon" |
| Extras | Responsive layout (desktop 3-column → tablet → mobile with bottom nav), TTS audio |

---

## Architecture

```
frontend/                      Next.js (client components talking to the REST API)
  app/(main)/…                 Pages inside the shell: path, leaderboard, profile, settings, shop, quests
  app/lesson/[id]/             Full-screen lesson route
  components/                  AppShell, Sidebar, RightRail, StatsBar, PathNode, Modal, Mascot, Icons
  components/lesson/           LessonPlayer (state machine), FeedbackBar, LessonComplete, exercises/*
  lib/                         api.ts (typed client), AppContext (user + toast providers), sound.ts

backend/
  app/main.py                  FastAPI app, CORS, startup seeding
  app/models.py                SQLAlchemy schema
  app/routers/                 users, path, lessons, leaderboard, dev  (thin HTTP layer)
  app/services/                hearts, streak, grading, achievements, path, clock (business rules)
  app/serializers.py           shapes the learner summary used by the top bar
  app/seed.py, content.py      course content + exercise generators + sample learners
  tests/                       pytest suite for the lesson loop and gamification rules
```

**Design decisions**
- **Server-side grading.** The exercise `data` sent to the client contains only what a learner sees; the answer key lives in `Exercise.answer` and is checked at `POST /exercises/{id}/check`. Hearts are therefore authoritative on the server. (Match-pairs tap feedback uses a small per-pair endpoint.)
- **Lazy hearts regeneration.** No background job: `sync_hearts()` converts elapsed time into hearts whenever the learner is loaded.
- **Testable days.** Each learner has a `day_offset`; `today = real today + offset`. The Settings page can advance days to demonstrate streak increment/break without waiting.
- **Progress only advances on the next level.** Replaying a finished level still earns XP but does not move the skill forward; skills unlock only when the previous skill (across units) is completed.
- **Content as data.** Lessons are generated from vocab/phrases in `content.py` at seed time and stored as ordinary rows, so a CMS or admin API could replace the seed without code changes.

---

## Database schema

```
courses 1──* units 1──* skills 1──* lessons 1──* exercises
   │
   └──* users 1──* user_skill_progress *──1 skills
              1──* lesson_completions  *──1 lessons
              1──* xp_events
              1──* user_achievements   *──1 achievements
```

| Table | Key columns | Notes |
|---|---|---|
| `courses` | `language_code` (unique), `name`, `from_language` | |
| `units` | `course_id`, `order_index`, `title`, `description`, `color` | unique (course, order) |
| `skills` | `unit_id`, `order_index`, `title`, `icon` | unique (unit, order) |
| `lessons` | `skill_id`, `order_index` (0-based level), `title` | 3 per skill |
| `exercises` | `lesson_id`, `order_index`, `type`, `prompt`, `data` JSON, `answer` JSON | `data` = shown to learner, `answer` = grading key |
| `users` | `username`, `total_xp`, `gems`, `daily_goal_xp`, `streak_count`, `longest_streak`, `last_active_date`, `hearts`, `hearts_updated_at`, `day_offset`, `course_id`, `is_seeded_bot` | |
| `user_skill_progress` | `user_id`, `skill_id`, `lessons_completed` | unique (user, skill); crowns = levels done |
| `lesson_completions` | `user_id`, `lesson_id`, `xp_earned`, `mistakes`, `is_perfect`, `completed_at` | immutable log incl. replays |
| `xp_events` | `user_id`, `amount`, `source`, `day`, `created_at` | ledger for daily goal, week view, leaderboard |
| `achievements` | `code` (unique), `title`, `metric`, `threshold` | catalogue |
| `user_achievements` | `user_id`, `achievement_id`, `unlocked_at` | unique pair |

Foreign keys are enforced (`PRAGMA foreign_keys=ON`) with cascading deletes for the content tree.

---

## API overview

All routes are prefixed with `/api`. The acting learner is the seeded default user (auth is simplified).

| Method & path | Purpose |
|---|---|
| `GET /users/me` | Top-bar summary: XP, gems, streak, hearts (+regen timer), daily goal progress, 7-day activity |
| `PATCH /users/me` | Update `display_name` / `daily_goal_xp` (10, 20, 30, 50) |
| `POST /users/me/hearts/refill` | `{method: "gems" \| "practice"}` – refill hearts (402 if not enough gems) |
| `GET /users/me/profile` | Summary + lifetime stats + achievements with unlock state |
| `GET /path` | Units → skills with `status`, `lessons_completed/total`, `next_lesson_id`, `is_current` |
| `GET /lessons/{id}` | Exercises without answers (403 if the skill is locked or hearts are 0) |
| `POST /exercises/{id}/check` | `{answer}` → `{correct, correct_answer, hearts, out_of_hearts}`; wrong answer costs a heart |
| `POST /exercises/{id}/pair` | Live feedback for one match-pairs tap (no heart cost) |
| `POST /lessons/{id}/complete` | `{mistakes}` → XP, streak update, skill progress, unlocks, new achievements, refreshed summary |
| `GET /leaderboard` | Weekly XP ranking across all learners (seeded + you) |
| `POST /dev/advance-day`, `POST /dev/reset-hearts` | Testing helpers used by Settings |
| `GET /health` | Health check |

**Rules:** lesson = 10 XP (+5 if no mistakes) and 5 gems. Heart regenerates every 30 min; gem refill costs 350. A streak extends on the first lesson of a day, resets to 1 after a missed day, and displays as 0 once a day has been skipped.

---

## Deployment

**API (Render):** use the included `render.yaml` (root directory `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`). Set `CORS_ORIGINS` to the frontend URL.
**Frontend (Vercel / Netlify):** root directory `frontend`, set `NEXT_PUBLIC_API_URL` to the deployed API URL, then deploy.

> Free hosting tiers use an ephemeral disk, so the SQLite file is recreated and re-seeded on each restart. Attach a persistent disk and set `DATABASE_URL=sqlite:////data/duolingo.db` if progress must survive redeploys.

## Assumptions & limitations
- One seeded course (Spanish for English speakers), 9 skills × 3 levels; vocabulary is small by design.
- Single default learner, no login. The leaderboard uses seeded "bot" learners with XP spread over the last 7 days.
- Speaking exercises, purchases, Super, friends and extra languages are placeholders.
- Pixel-exact reproduction of Duolingo's proprietary artwork is intentionally not attempted; layout, colours, 3D buttons, feedback bar and path mechanics follow Duolingo's UX patterns with original assets.
