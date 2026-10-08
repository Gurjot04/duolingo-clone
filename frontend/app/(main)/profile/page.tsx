"use client";
import { useEffect, useState } from "react";
import { AchievementGlyph, Bolt, Flame, Trophy } from "@/components/Icons";
import { api, Profile } from "@/lib/api";
import { useUser } from "@/lib/AppContext";

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const { user } = useUser();
  useEffect(() => { api.profile().then(setP).catch(() => {}); }, [user?.total_xp]);
  if (!p) return <div className="page narrow"><div className="skeleton-path" /></div>;

  const unlocked = p.achievements.filter((a) => a.unlocked).length;
  const joined = new Date(p.joined).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <div className="page narrow">
      <div className="profile-hero">
        <span className="avatar xl" style={{ background: p.avatar_color }}>{p.display_name[0]}</span>
        <div>
          <h1>{p.display_name}</h1>
          <div className="muted">@{p.username} · Joined {joined}</div>
          <div className="muted">🇪🇸 Learning Spanish</div>
        </div>
      </div>

      <h2 className="section-title">Statistics</h2>
      <div className="stat-grid">
        <div className="stat-card"><Flame size={30} /><div><b>{p.streak}</b><span>Day streak</span></div></div>
        <div className="stat-card"><Bolt size={30} /><div><b>{p.total_xp}</b><span>Total XP</span></div></div>
        <div className="stat-card"><Trophy size={30} /><div><b>{p.longest_streak}</b><span>Longest streak</span></div></div>
        <div className="stat-card"><span style={{ fontSize: 28 }}>📘</span><div><b>{p.lessons_completed}</b><span>Lessons done</span></div></div>
      </div>

      <h2 className="section-title">Achievements <small>{unlocked}/{p.achievements.length}</small></h2>
      <div className="ach-list">
        {p.achievements.map((a) => (
          <div key={a.code} className={`ach ${a.unlocked ? "" : "locked"}`}>
            <div className="ach-icon"><AchievementGlyph name={a.icon} /></div>
            <div className="ach-body"><b>{a.title}</b><span>{a.description}</span></div>
            {a.unlocked && <span className="ach-done">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
