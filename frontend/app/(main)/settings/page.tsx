"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast, useUser } from "@/lib/AppContext";

const GOALS = [
  { xp: 10, label: "Casual", sub: "10 XP / day" },
  { xp: 20, label: "Regular", sub: "20 XP / day" },
  { xp: 30, label: "Serious", sub: "30 XP / day" },
  { xp: 50, label: "Intense", sub: "50 XP / day" },
];

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const toast = useToast();
  const [name, setName] = useState<string | null>(null);

  if (!user) return null;
  const setGoal = async (xp: number) => {
    try { setUser(await api.updateSettings({ daily_goal_xp: xp })); toast(`Daily goal set to ${xp} XP`, "success"); }
    catch (e: any) { toast(e.message, "error"); }
  };
  const saveName = async () => {
    if (!name?.trim()) return;
    try { setUser(await api.updateSettings({ display_name: name })); toast("Name updated", "success"); setName(null); }
    catch (e: any) { toast(e.message, "error"); }
  };
  const dev = async (fn: () => Promise<any>, msg: string) => { try { setUser(await fn()); toast(msg, "success"); } catch (e: any) { toast(e.message, "error"); } };
  const soon = () => toast("Coming soon!");

  return (
    <div className="page narrow">
      <h1>Settings</h1>

      <h2 className="section-title">Account</h2>
      <div className="form-row">
        <input className="input" value={name ?? user.display_name} maxLength={32} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-blue" disabled={name === null} onClick={saveName}>SAVE</button>
      </div>
      <button className="setting-row" onClick={soon}>Email &amp; password <span>Coming soon</span></button>
      <button className="setting-row" onClick={soon}>Sound effects &amp; speaking exercises <span>Coming soon</span></button>
      <button className="setting-row" onClick={soon}>Notifications <span>Coming soon</span></button>

      <h2 className="section-title">Daily goal</h2>
      <div className="goal-grid">
        {GOALS.map((g) => (
          <button key={g.xp} className={`goal ${user.daily_goal_xp === g.xp ? "active" : ""}`} onClick={() => setGoal(g.xp)}>
            <b>{g.label}</b><span>{g.sub}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">Super</h2>
      <button className="setting-row" onClick={soon}>Manage subscription <span>Coming soon</span></button>

      <h2 className="section-title">Testing tools</h2>
      <p className="muted">Simulate days and hearts to try the streak and heart logic quickly.</p>
      <div className="dev-row">
        <button className="btn btn-outline btn-sm" onClick={() => dev(() => api.advanceDay(1), "Moved to the next day")}>+1 DAY</button>
        <button className="btn btn-outline btn-sm" onClick={() => dev(() => api.advanceDay(2), "Skipped 2 days (streak breaks)")}>+2 DAYS</button>
        <button className="btn btn-outline btn-sm" onClick={() => dev(() => api.setHearts(0), "Hearts set to 0")}>0 HEARTS</button>
        <button className="btn btn-outline btn-sm" onClick={() => dev(() => api.setHearts(5), "Hearts restored")}>5 HEARTS</button>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>Simulated date: {user.today}</p>
    </div>
  );
}
