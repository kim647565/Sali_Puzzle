import { Cell } from "./wordHunt";

export type Round = {
  id: string;
  playerId: string;
  levelId: string;
  startedAt: string;
  elapsedMs: number;
  paused: boolean;
  found: Record<string, Cell[]>;
  solved: string[];
  letters: Record<string, string>;
  wrong: number;
  hints: number;
  result?: { score: number; accuracy: number; stars: number; completedAt: string };
};

export const pointsPerAnswer = 100;

export function scoreRound(round: Round, completedAt: string) {
  const correct = Object.keys(round.found).length + round.solved.length;
  const submissions = correct + round.wrong;
  const accuracy = submissions ? 100 * correct / submissions : 0;
  return { score: correct * pointsPerAnswer, accuracy, stars: accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : 1, completedAt };
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export type AnswerLog = { stage: "word-hunt" | "crossword"; answer: string; correct: boolean };

export type Attempt = {
  id: string;
  levelId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  startedAt: string;
  completedAt: string | null;
  wordHuntScore: number;
  crosswordScore: number;
  score: number;
  correct: number;
  wrong: number;
  accuracy: number | null;
  hints: number;
  duration: number;
  stars: number;
};
