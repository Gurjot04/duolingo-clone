"use client";
import { ReactNode } from "react";
import { useUser } from "@/lib/AppContext";
import Mascot from "./Mascot";
import RightRail from "./RightRail";
import Sidebar from "./Sidebar";
import StatsBar from "./StatsBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const { error, refresh } = useUser();
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="mobile-stats"><StatsBar /></div>
        {error ? (
          <div className="empty-state">
            <Mascot mood="sad" size={150} />
            <h2>Can’t reach the server</h2>
            <p>{error}</p>
            <button className="btn btn-green" onClick={refresh}>TRY AGAIN</button>
          </div>
        ) : children}
      </main>
      <RightRail />
    </div>
  );
}
