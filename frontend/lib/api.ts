const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {}
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

// ------------------------------------------------------------------ types
export interface WeekDay { date: string; weekday: string; active: boolean; is_today: boolean }

export interface UserSummary {
  id: number; username: string; display_name: string; avatar_color: string;
  total_xp: number; gems: number; streak: number; practiced_today: boolean;
  hearts: number; max_hearts: number; next_heart_in_seconds: number | null;
  heart_regen_seconds: number; heart_refill_cost: number;
  daily_goal_xp: number; daily_xp: number; today: string; week: WeekDay[];
}

export interface Achievement {
  code: string; title: string; description: string; icon: string;
  unlocked: boolean; unlocked_at: string | null; metric: string; threshold: number;
}

export interface Profile extends UserSummary {
  joined: string; longest_streak: number; lessons_completed: number; achievements: Achievement[];
}

export interface PathSkill {
  id: number; title: string; icon: string; status: "locked" | "available" | "completed";
  lessons_completed: number; lessons_total: number; next_lesson_id: number; is_current: boolean;
}
export interface PathUnit { id: number; title: string; description: string; color: string; order_index: number; skills: PathSkill[] }
export interface PathData { course: { id: number; name: string; language_code: string }; units: PathUnit[] }

export type ExerciseType = "multiple_choice" | "translate" | "match_pairs" | "fill_blank" | "type_answer";
export interface Exercise {
  id: number; type: ExerciseType; prompt: string;
  data: {
    options?: string[]; shown?: string; speak?: string; es_to_en?: boolean;
    source?: string; bank?: string[]; sentence?: string; target_lang?: string;
    left?: string[]; right?: string[];
  };
}
export interface Lesson { id: number; title: string; skill_id: number; skill_title: string; level: number; exercises: Exercise[] }

export interface CheckResult { correct: boolean; correct_answer: string; hearts: number; out_of_hearts: boolean }

export interface CompleteResult {
  xp_earned: number; perfect: boolean; gems_earned: number; streak_extended: boolean;
  goal_reached_now: boolean; skill_completed: boolean; unlocked_skill: string | null;
  new_achievements: { code: string; title: string; icon: string }[]; user: UserSummary;
}

export interface LeaderboardEntry {
  rank: number; user_id: number; display_name: string; avatar_color: string; weekly_xp: number; is_me: boolean;
}

// ------------------------------------------------------------------ calls
export const api = {
  me: () => request<UserSummary>("/api/users/me"),
  profile: () => request<Profile>("/api/users/me/profile"),
  updateSettings: (body: { display_name?: string; daily_goal_xp?: number }) =>
    request<UserSummary>("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  refillHearts: (method: "gems" | "practice") =>
    request<UserSummary>("/api/users/me/hearts/refill", { method: "POST", body: JSON.stringify({ method }) }),
  path: () => request<PathData>("/api/path"),
  lesson: (id: number) => request<Lesson>(`/api/lessons/${id}`),
  check: (exerciseId: number, answer: unknown) =>
    request<CheckResult>(`/api/exercises/${exerciseId}/check`, { method: "POST", body: JSON.stringify({ answer }) }),
  checkPair: (exerciseId: number, left: string, right: string) =>
    request<{ correct: boolean }>(
      `/api/exercises/${exerciseId}/pair?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`,
      { method: "POST" }),
  complete: (lessonId: number, mistakes: number) =>
    request<CompleteResult>(`/api/lessons/${lessonId}/complete`, { method: "POST", body: JSON.stringify({ mistakes }) }),
  leaderboard: () => request<{ league: string; entries: LeaderboardEntry[] }>("/api/leaderboard"),
  advanceDay: (days: number) =>
    request<UserSummary>("/api/dev/advance-day", { method: "POST", body: JSON.stringify({ days }) }),
  setHearts: (hearts: number) => request<UserSummary>(`/api/dev/reset-hearts?hearts=${hearts}`, { method: "POST" }),
};
