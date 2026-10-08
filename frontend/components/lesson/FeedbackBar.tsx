"use client";
import { useMemo } from "react";

const PRAISE = ["Nicely done!", "Great job!", "Awesome!", "Correct!", "You’re on fire!", "Excellent!"];

export default function FeedbackBar({ correct, answer, onContinue }: { correct: boolean; answer: string; onContinue: () => void }) {
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], []);
  return (
    <div className={`feedback ${correct ? "ok" : "bad"}`}>
      <div className="feedback-inner">
        <div className="feedback-icon">{correct ? "✓" : "✕"}</div>
        <div className="feedback-text">
          <b>{correct ? praise : "Correct solution:"}</b>
          {!correct && <span>{answer}</span>}
        </div>
        <button className={`btn ${correct ? "btn-green" : "btn-red"} feedback-btn`} onClick={onContinue} autoFocus>CONTINUE</button>
      </div>
    </div>
  );
}
