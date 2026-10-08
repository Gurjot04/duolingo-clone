import { Exercise } from "@/lib/api";

export interface ExerciseProps {
  exercise: Exercise;
  /** true once the answer was checked (inputs become read-only) */
  locked: boolean;
  result: "correct" | "wrong" | null;
  /** report the current answer; null means "nothing to check yet" */
  onAnswer: (answer: unknown | null) => void;
  /** for self-completing exercises (match pairs) */
  onAutoSubmit: (answer: unknown) => void;
}
