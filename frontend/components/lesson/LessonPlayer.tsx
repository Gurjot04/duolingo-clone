"use client";
import type React from "react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Close, Heart } from "@/components/Icons";
import Mascot from "@/components/Mascot";
import Modal from "@/components/Modal";
import { api, ApiError, CheckResult, CompleteResult, Exercise, Lesson } from "@/lib/api";
import { useToast, useUser } from "@/lib/AppContext";
import { sfx } from "@/lib/sound";
import FeedbackBar from "./FeedbackBar";
import LessonComplete from "./LessonComplete";
import FillBlank from "./exercises/FillBlank";
import MatchPairs from "./exercises/MatchPairs";
import MultipleChoice from "./exercises/MultipleChoice";
import Translate from "./exercises/Translate";
import TypeAnswer from "./exercises/TypeAnswer";
import { ExerciseProps } from "./exercises/types";

const RENDERERS: Record<Exercise["type"], (p: ExerciseProps) => React.JSX.Element> = {
  multiple_choice: MultipleChoice, translate: Translate, match_pairs: MatchPairs,
  fill_blank: FillBlank, type_answer: TypeAnswer,
};

type Status = "idle" | "checking" | "checked";

export default function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const toast = useToast();
  const { user, setUser, refresh } = useUser();

  const total = lesson.exercises.length;
  const [queue, setQueue] = useState<Exercise[]>(lesson.exercises);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<unknown | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState<number | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [quit, setQuit] = useState(false);
  const [complete, setComplete] = useState<CompleteResult | null>(null);
  const [shake, setShake] = useState(false);
  const startedAt = useRef(Date.now());
  const seconds = useRef(0);

  const current = queue[idx];
  const shownHearts = hearts ?? user?.hearts ?? 5;
  const progress = Math.round((correctCount / total) * 100);

  const submit = useCallback(async (a: unknown) => {
    if (!current || status !== "idle" || a === null) return;
    setStatus("checking");
    try {
      const r = await api.check(current.id, a);
      setResult(r);
      setHearts(r.hearts);
      setStatus("checked");
      if (r.correct) { sfx.correct(); setCorrectCount((c) => c + 1); }
      else { sfx.wrong(); setMistakes((m) => m + 1); setShake(true); setTimeout(() => setShake(false), 500); }
    } catch (e) {
      setStatus("idle");
      if (e instanceof ApiError && e.message === "out_of_hearts") setOutOfHearts(true);
      else toast((e as Error).message, "error");
    }
  }, [current, status, toast]);

  const finish = useCallback(async () => {
    seconds.current = Math.round((Date.now() - startedAt.current) / 1000);
    try {
      const r = await api.complete(lesson.id, mistakes);
      setUser(r.user);
      setComplete(r);
    } catch (e) {
      toast((e as Error).message, "error");
      router.push("/");
    }
  }, [lesson.id, mistakes, router, setUser, toast]);

  const advance = useCallback(() => {
    if (!result) return;
    let q = queue;
    if (!result.correct) q = [...queue, current]; // wrong answers come back at the end, like Duolingo
    setQueue(q);
    setAnswer(null);
    setResult(null);
    setStatus("idle");
    if (!result.correct && result.out_of_hearts) { setOutOfHearts(true); setIdx(idx + 1); return; }
    if (idx + 1 >= q.length) finish(); else setIdx(idx + 1);
  }, [result, queue, current, idx, finish]);

  const skip = () => {
    if (status !== "idle") return;
    setQueue([...queue, current]);
    setAnswer(null);
    setIdx(idx + 1);
  };

  // Enter = check / continue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || complete || outOfHearts || quit) return;
      if (status === "checked") advance();
      else if (status === "idle" && answer !== null) submit(answer);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, answer, advance, submit, complete, outOfHearts, quit]);

  const refill = async (method: "gems" | "practice") => {
    try {
      const u = await api.refillHearts(method);
      setUser(u); setHearts(u.hearts); setOutOfHearts(false);
      toast(method === "gems" ? "Hearts refilled!" : "You earned a heart!", "success");
      if (idx >= queue.length) finish();
    } catch (e) { toast((e as Error).message, "error"); }
  };

  const leave = async () => { await refresh(); router.push("/"); };
  const accuracy = useMemo(() => Math.max(0, Math.round((total / (total + mistakes)) * 100)), [total, mistakes]);

  if (complete) {
    return <LessonComplete result={complete} accuracy={accuracy} seconds={seconds.current}
      skillTitle={lesson.skill_title} onDone={leave} />;
  }
  if (!current) return null;

  const Renderer = RENDERERS[current.type];
  const locked = status !== "idle";

  return (
    <div className={`lesson ${shake ? "shake" : ""}`}>
      <header className="lesson-top">
        <button className="icon-btn" onClick={() => setQuit(true)} aria-label="Quit lesson"><Close size={28} /></button>
        <div className="progress"><div className="progress-fill" style={{ width: `${Math.max(progress, 3)}%` }}><i /></div></div>
        <div className="lesson-hearts"><Heart size={28} /><b>{shownHearts}</b></div>
      </header>

      <main className="lesson-main">
        <div className="lesson-content" key={`${current.id}-${idx}`}>
          <Renderer exercise={current} locked={locked} result={result ? (result.correct ? "correct" : "wrong") : null}
            onAnswer={(a) => setAnswer(a)} onAutoSubmit={(a) => { setAnswer(a); submit(a); }} />
        </div>
      </main>

      {status === "checked" && result ? (
        <FeedbackBar correct={result.correct} answer={result.correct_answer} onContinue={advance} />
      ) : (
        <footer className="lesson-footer">
          <div className="footer-inner">
            <button className="btn btn-outline btn-lg" onClick={skip}>SKIP</button>
            <button className={`btn btn-lg ${answer !== null ? "btn-green" : "btn-disabled"}`}
              disabled={answer === null || status === "checking"} onClick={() => submit(answer)}>CHECK</button>
          </div>
        </footer>
      )}

      {quit && (
        <Modal variant="sheet" onClose={() => setQuit(false)}>
          <Mascot mood="sad" size={110} />
          <h2 className="modal-title">Wait, don’t go!</h2>
          <p className="modal-text">You’ll lose your progress in this lesson if you quit now.</p>
          <button className="btn btn-green btn-block" onClick={() => setQuit(false)}>KEEP LEARNING</button>
          <button className="btn btn-outline-red btn-block" onClick={leave}>END SESSION</button>
        </Modal>
      )}

      {outOfHearts && (
        <Modal>
          <Mascot mood="sad" size={130} />
          <h2 className="modal-title">You ran out of hearts!</h2>
          <p className="modal-text">Earn a heart back by practicing, or refill with gems to keep this lesson going.</p>
          <button className="btn btn-green btn-block" onClick={() => refill("practice")}>PRACTICE TO EARN +1 HEART</button>
          <button className="btn btn-blue btn-block" disabled={!user || user.gems < user.heart_refill_cost} onClick={() => refill("gems")}>
            REFILL FOR {user?.heart_refill_cost ?? 350} GEMS
          </button>
          <button className="btn btn-outline btn-block" onClick={() => toast("Super is coming soon!")}>UNLIMITED HEARTS · SUPER</button>
          <button className="btn-text" onClick={leave}>NO THANKS</button>
        </Modal>
      )}
    </div>
  );
}
