"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import Mascot from "@/components/Mascot";
import PathNode from "@/components/PathNode";
import { api, PathData, PathSkill } from "@/lib/api";
import { useToast, useUser } from "@/lib/AppContext";

const OFFSETS = [0, -42, -66, -42, 0, 42, 66, 42];

export default function LearnPage() {
  const [path, setPath] = useState<PathData | null>(null);
  const [openSkill, setOpenSkill] = useState<number | null>(null);
  const [noHearts, setNoHearts] = useState(false);
  const router = useRouter();
  const { user, refresh, setUser } = useUser();
  const toast = useToast();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.path().then(setPath).catch((e) => toast(e.message, "error")); }, [toast]);
  useEffect(() => {
    if (path) setTimeout(() => currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 150);
  }, [path]);

  const start = (s: PathSkill) => {
    if (user && user.hearts <= 0) return setNoHearts(true);
    router.push(`/lesson/${s.next_lesson_id}`);
  };

  const refill = async (method: "gems" | "practice") => {
    try { setUser(await api.refillHearts(method)); setNoHearts(false); toast("You earned hearts back!", "success"); }
    catch (e: any) { toast(e.message, "error"); }
  };

  if (!path) return <div className="path-page"><div className="skeleton-path" /></div>;

  let globalIdx = 0;
  return (
    <div className="path-page" onClick={() => setOpenSkill(null)}>
      {path.units.map((unit) => (
        <section key={unit.id} className="unit">
          <header className="unit-header" style={{ background: unit.color }}>
            <div>
              <div className="unit-kicker">SECTION 1, {unit.title.toUpperCase()}</div>
              <div className="unit-desc">{unit.description}</div>
            </div>
            <button className="guide-btn" onClick={(e) => { e.stopPropagation(); toast("The guidebook is coming soon!"); }}>
              <span>📖</span>
            </button>
          </header>
          <div className="unit-path">
            {unit.skills.map((skill) => {
              const offset = OFFSETS[globalIdx++ % OFFSETS.length];
              return (
                <div key={skill.id} ref={skill.is_current ? currentRef : undefined} onClick={(e) => e.stopPropagation()}>
                  <PathNode skill={skill} color={unit.color} offset={offset} xpPerLesson={10}
                    open={openSkill === skill.id}
                    onToggle={() => setOpenSkill(openSkill === skill.id ? null : skill.id)}
                    onStart={() => start(skill)} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <div className="path-end">
        <Mascot mood="wink" size={120} />
        <p>More units coming soon!</p>
      </div>

      {noHearts && (
        <Modal onClose={() => setNoHearts(false)}>
          <Mascot mood="sad" size={120} />
          <h2 className="modal-title">You ran out of hearts!</h2>
          <p className="modal-text">Practice to earn a heart back, or refill with gems.</p>
          <button className="btn btn-green btn-block" onClick={() => refill("practice")}>PRACTICE TO EARN +1 HEART</button>
          <button className="btn btn-outline btn-block" disabled={!user || user.gems < user.heart_refill_cost} onClick={() => refill("gems")}>
            REFILL FOR {user?.heart_refill_cost} GEMS
          </button>
          <button className="btn-text" onClick={() => { setNoHearts(false); refresh(); }}>NO THANKS</button>
        </Modal>
      )}
    </div>
  );
}
