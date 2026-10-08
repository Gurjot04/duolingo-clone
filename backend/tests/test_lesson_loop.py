def _next_lesson(client):
    path = client.get("/api/path").json()
    for unit in path["units"]:
        for s in unit["skills"]:
            if s["is_current"]:
                return s
    raise AssertionError("no current skill")


def test_seeded_learner_and_path(client):
    me = client.get("/api/users/me").json()
    assert me["total_xp"] == 110 and me["streak"] == 4 and me["hearts"] == 5
    path = client.get("/api/path").json()
    statuses = [s["status"] for u in path["units"] for s in u["skills"]]
    assert statuses[:2] == ["completed", "completed"] and statuses[2] == "available"
    assert set(statuses[3:]) == {"locked"}


def test_locked_skill_rejected(client):
    path = client.get("/api/path").json()
    locked = path["units"][1]["skills"][0]
    assert client.get(f"/api/lessons/{locked['next_lesson_id']}").status_code == 403


def test_lesson_has_all_exercise_types_without_answers(client):
    skill = _next_lesson(client)
    lesson = client.get(f"/api/lessons/{skill['next_lesson_id']}").json()
    assert {e["type"] for e in lesson["exercises"]} == {"multiple_choice", "translate", "match_pairs",
                                                       "fill_blank", "type_answer"}
    assert "answer" not in str(lesson).lower().replace("type_answer", "")


def test_wrong_answer_costs_heart_and_complete_awards_xp_and_streak(client):
    skill = _next_lesson(client)
    lesson = client.get(f"/api/lessons/{skill['next_lesson_id']}").json()
    ex = lesson["exercises"][0]
    r = client.post(f"/api/exercises/{ex['id']}/check", json={"answer": "definitely wrong"}).json()
    assert r["correct"] is False and r["hearts"] == 4

    done = client.post(f"/api/lessons/{lesson['id']}/complete", json={"mistakes": 1}).json()
    assert done["xp_earned"] == 10 and done["streak_extended"] is True
    assert done["user"]["streak"] == 5 and done["user"]["total_xp"] == 120
    after = _next_lesson(client)
    assert after["lessons_completed"] == skill["lessons_completed"] + 1


def test_out_of_hearts_blocks_and_refill_works(client):
    client.post("/api/dev/reset-hearts?hearts=0")
    skill = _next_lesson(client)
    assert client.get(f"/api/lessons/{skill['next_lesson_id']}").status_code == 403
    me = client.post("/api/users/me/hearts/refill", json={"method": "gems"}).json()
    assert me["hearts"] == 5 and me["gems"] == 150


def test_streak_breaks_after_skipped_days(client):
    client.post("/api/dev/advance-day", json={"days": 3})
    assert client.get("/api/users/me").json()["streak"] == 0


def test_leaderboard_includes_me(client):
    entries = client.get("/api/leaderboard").json()["entries"]
    assert any(e["is_me"] for e in entries) and entries[0]["weekly_xp"] >= entries[-1]["weekly_xp"]


def test_typed_answer_accepts_missing_accents(client):
    skill = _next_lesson(client)
    lesson = client.get(f"/api/lessons/{skill['next_lesson_id']}").json()
    ex = next(e for e in lesson["exercises"] if e["type"] == "type_answer")
    wrong = client.post(f"/api/exercises/{ex['id']}/check", json={"answer": "zzz"}).json()
    ans = wrong["correct_answer"]
    import unicodedata
    plain = "".join(c for c in unicodedata.normalize("NFD", ans) if unicodedata.category(c) != "Mn")
    assert client.post(f"/api/exercises/{ex['id']}/check", json={"answer": plain.upper()}).json()["correct"]
