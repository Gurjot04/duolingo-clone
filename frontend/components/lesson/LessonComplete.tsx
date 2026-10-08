"use client";
import { useEffect, useMemo, useState } from "react";
import { Bolt, Flame, Trophy } from "@/components/Icons";
import Mascot from "@/components/Mascot";
import { CompleteResult } from "@/lib/api";
import { sfx } from "@/lib/sound";

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 1.2, dur: 2.4 + Math.random() * 2,
    color: ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"][i % 6], rot: Math.random() * 360,
  })), []);
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  );
}

export default function LessonComplete({ result, accuracy, seconds, skillTitle, onDone }: {
  result: CompleteResult; accuracy: number; seconds: number; skillTitle: string; onDone: () => void;
}) {
  const [screen, setScreen] = useState<"summary" | "streak">("summary");
  useEffect(() => { sfx.finish(); }, []);
  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const u = result.user;

  if (screen === "streak") {
    return (
      <div className="complete-screen">
        <div className="complete-body">
          <div className="streak-hero"><Flame size={120} className="flame-pop" /></div>
          <h1 className="streak-count">{u.streak}</h1>
          <h2 className="complete-title orange">day streak!</h2>
          <div className="week-row big">
            {u.week.map((d) => (
              <div key={d.date} className={`week-day ${d.active ? "active" : ""} ${d.is_today ? "today" : ""}`}>
                <span>{d.weekday}</span><Flame size={30} off={!d.active} />
              </div>
            ))}
          </div>
          <p className="muted center">You’re on a roll! Practice every day to keep it going.</p>
        </div>
        <div className="complete-footer"><button className="btn btn-green btn-lg" onClick={onDone}>CONTINUE</button></div>
      </div>
    );
  }

  return (
    <div className="complete-screen">
      <Confetti />
      <div className="complete-body">
        <Mascot mood="cheer" size={170} className="bounce" />
        <h1 className="complete-title">{result.skill_completed ? `${skillTitle} complete!` : "Lesson Complete!"}</h1>
        <div className="result-cards">
          <div className="result-card" style={{ borderColor: "#ffc800" }}>
            <div className="rc-head" style={{ background: "#ffc800" }}>TOTAL XP</div>
            <div className="rc-body" style={{ color: "#ffc800" }}><Bolt size={26} /> {result.xp_earned}</div>
          </div>
          <div className="result-card" style={{ borderColor: "#58cc02" }}>
            <div className="rc-head" style={{ background: "#58cc02" }}>{accuracy === 100 ? "AMAZING" : "GOOD"}</div>
            <div className="rc-body" style={{ color: "#58cc02" }}>🎯 {accuracy}%</div>
          </div>
          <div className="result-card" style={{ borderColor: "#1cb0f6" }}>
            <div className="rc-head" style={{ background: "#1cb0f6" }}>TIME</div>
            <div className="rc-body" style={{ color: "#1cb0f6" }}>⏱ {mm}</div>
          </div>
        </div>
        {result.goal_reached_now && (
          <div className="banner"><Trophy size={30} /> Daily goal reached! {u.daily_goal_xp} XP today.</div>
        )}
        {result.unlocked_skill && <div className="banner">🔓 New skill unlocked: <b>{result.unlocked_skill}</b></div>}
        {result.new_achievements.map((a) => <div key={a.code} className="banner">🏅 Achievement: <b>{a.title}</b></div>)}
        <p className="muted center">+{result.gems_earned} gems</p>
      </div>
      <div className="complete-footer">
        <button className="btn btn-green btn-lg" onClick={() => (result.streak_extended ? setScreen("streak") : onDone())}>CONTINUE</button>
      </div>
    </div>
  );
}
