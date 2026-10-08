"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useToast, useUser } from "@/lib/AppContext";
import { Flame, Gem, Heart } from "./Icons";
import Mascot from "./Mascot";

function fmtCountdown(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Top bar: course flag, streak, gems, hearts - each opens a small popover like the original. */
export default function StatsBar() {
  const { user, setUser, refresh } = useUser();
  const toast = useToast();
  const [open, setOpen] = useState<null | "streak" | "gems" | "hearts" | "course">(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setCountdown(user?.next_heart_in_seconds ?? null), [user]);
  useEffect(() => {
    if (countdown === null) return;
    const t = setInterval(() => setCountdown((c) => {
      if (c === null) return c;
      if (c <= 1) { refresh(); return null; }
      return c - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [countdown === null, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return <div className="stats-bar stats-skeleton" />;
  const toggle = (k: typeof open) => setOpen((o) => (o === k ? null : k));

  const refill = async (method: "gems" | "practice") => {
    try {
      setUser(await api.refillHearts(method));
      toast(method === "gems" ? "Hearts refilled!" : "You earned a heart back!", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="stats-bar" ref={ref}>
      <div className="stat-wrap">
        <button className="stat" onClick={() => toggle("course")} aria-label="Course">
          <span className="flag">🇪🇸</span>
        </button>
        {open === "course" && (
          <div className="popover">
            <div className="popover-title">My courses</div>
            <div className="course-row active"><span className="flag">🇪🇸</span> Spanish</div>
            <button className="course-row" onClick={() => toast("More languages are coming soon!")}>＋ Add a new course</button>
          </div>
        )}
      </div>

      <div className="stat-wrap">
        <button className={`stat stat-streak ${user.streak === 0 ? "off" : ""}`} onClick={() => toggle("streak")}>
          <Flame size={26} off={!user.practiced_today} />
          <span style={{ color: user.practiced_today ? "#ff9600" : "#afafaf" }}>{user.streak}</span>
        </button>
        {open === "streak" && (
          <div className="popover popover-wide">
            <div className="popover-title">{user.streak} day streak</div>
            <p className="popover-sub">
              {user.practiced_today ? "You practiced today. Come back tomorrow!" : "Do a lesson today to extend your streak!"}
            </p>
            <div className="week-row">
              {user.week.map((d) => (
                <div key={d.date} className={`week-day ${d.active ? "active" : ""} ${d.is_today ? "today" : ""}`}>
                  <span>{d.weekday}</span>
                  <Flame size={22} off={!d.active} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stat-wrap">
        <button className="stat stat-gems" onClick={() => toggle("gems")}>
          <Gem size={24} /><span>{user.gems}</span>
        </button>
        {open === "gems" && (
          <div className="popover">
            <div className="popover-title">Gems</div>
            <p className="popover-sub">You have {user.gems} gems. Earn more by finishing lessons.</p>
            <button className="btn btn-blue btn-sm" onClick={() => toast("The Shop is coming soon!")}>Go to shop</button>
          </div>
        )}
      </div>

      <div className="stat-wrap">
        <button className="stat stat-hearts" onClick={() => toggle("hearts")}>
          <Heart size={24} /><span>{user.hearts}</span>
        </button>
        {open === "hearts" && (
          <div className="popover popover-wide">
            <Mascot size={86} mood={user.hearts === 0 ? "sad" : "happy"} />
            <div className="popover-title">{user.hearts === user.max_hearts ? "Full hearts" : `${user.hearts} / ${user.max_hearts} hearts`}</div>
            <p className="popover-sub">
              {user.hearts === user.max_hearts
                ? "Keep learning! Mistakes cost a heart."
                : `Next heart in ${countdown !== null ? fmtCountdown(countdown) : "…"}`}
            </p>
            {user.hearts < user.max_hearts && (
              <>
                <button className="btn btn-green btn-block btn-sm" onClick={() => refill("practice")}>
                  Practice to earn +1 heart
                </button>
                <button className="btn btn-outline btn-block btn-sm" disabled={user.gems < user.heart_refill_cost}
                  onClick={() => refill("gems")}>
                  Refill for <Gem size={16} style={{ margin: "0 4px" }} /> {user.heart_refill_cost}
                </button>
              </>
            )}
            <button className="btn btn-outline btn-block btn-sm" onClick={() => toast("Super is coming soon!")}>
              Unlimited hearts · Super
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
