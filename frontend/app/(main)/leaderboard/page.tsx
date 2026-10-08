"use client";
import { useEffect, useState } from "react";
import Mascot from "@/components/Mascot";
import { api, LeaderboardEntry } from "@/lib/api";
import { useUser } from "@/lib/AppContext";

export default function LeaderboardPage() {
  const [data, setData] = useState<{ league: string; entries: LeaderboardEntry[] } | null>(null);
  const { user } = useUser();
  useEffect(() => { api.leaderboard().then(setData).catch(() => {}); }, [user?.total_xp]);

  return (
    <div className="page narrow">
      <div className="league-hero">
        <Mascot mood="cheer" size={110} />
        <h1>{data?.league ?? "Bronze League"}</h1>
        <p>Top 10 advance to the next league</p>
      </div>
      <div className="lb-list">
        {data?.entries.map((e) => (
          <div key={e.user_id} className={`lb-row ${e.is_me ? "me" : ""} ${e.rank <= 10 ? "promo" : ""}`}>
            <b className="rank">{e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : e.rank}</b>
            <span className="avatar" style={{ background: e.avatar_color }}>{e.display_name[0]}</span>
            <span className="grow name">{e.display_name}{e.is_me && " (you)"}</span>
            <span className="xp">{e.weekly_xp} XP</span>
          </div>
        ))}
        {data && data.entries.length > 10 && <div className="lb-divider">Promotion zone ends here</div>}
      </div>
    </div>
  );
}
