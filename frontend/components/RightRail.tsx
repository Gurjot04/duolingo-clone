"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "@/lib/api";
import { useToast, useUser } from "@/lib/AppContext";
import StatsBar from "./StatsBar";
import { Bolt, Trophy } from "./Icons";

/** Desktop right column: stats, league teaser, daily quest (daily goal), Super promo placeholder. */
export default function RightRail() {
  const { user } = useUser();
  const toast = useToast();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { api.leaderboard().then((r) => setRows(r.entries.slice(0, 3))).catch(() => {}); }, [user?.total_xp]);

  const pct = user ? Math.min(100, Math.round((user.daily_xp / user.daily_goal_xp) * 100)) : 0;
  return (
    <aside className="right-rail">
      <StatsBar />

      <div className="card promo">
        <div className="promo-badge">SUPER</div>
        <h3>Try Super for free</h3>
        <p>No ads, unlimited hearts, and more!</p>
        <button className="btn btn-white btn-block" onClick={() => toast("Super is coming soon!")}>TRY 2 WEEKS FREE</button>
      </div>

      <div className="card">
        <div className="card-head"><h3>Daily Quests</h3><span className="link" onClick={() => toast("Quests are coming soon!")}>VIEW ALL</span></div>
        <div className="quest">
          <Bolt size={34} />
          <div className="quest-body">
            <div className="quest-title">Earn {user?.daily_goal_xp ?? 20} XP</div>
            <div className="quest-bar"><div style={{ width: `${pct}%` }} /><span>{user?.daily_xp ?? 0} / {user?.daily_goal_xp ?? 20}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Leaderboard</h3><Link href="/leaderboard" className="link">VIEW</Link></div>
        {rows.map((r) => (
          <div key={r.user_id} className={`mini-row ${r.is_me ? "me" : ""}`}>
            <b className="rank">{r.rank}</b>
            <span className="avatar sm" style={{ background: r.avatar_color }}>{r.display_name[0]}</span>
            <span className="grow">{r.display_name}</span>
            <span className="xp">{r.weekly_xp} XP</span>
          </div>
        ))}
        <div className="trophy-note"><Trophy size={20} /> Weekly XP leaderboard</div>
      </div>
      <div className="rail-links">
        <span onClick={() => toast("Coming soon")}>ABOUT</span><span onClick={() => toast("Coming soon")}>PRIVACY</span>
        <span onClick={() => toast("Coming soon")}>TERMS</span>
      </div>
    </aside>
  );
}
