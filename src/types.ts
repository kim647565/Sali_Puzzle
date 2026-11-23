export type LevelStatus = "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Level = {
  id: string;
  number: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  lesson: string;
  example: string;
  summary: string;
  objectives: string[];
  vocabulary: { word: string; definition: string }[];
  huntWords: string[];
  clues: { number: number; clue: string; answer: string; row: number; column: number; direction: "across" | "down" }[];
  grid: string[][];
};

export type Progress = {
  [levelId: string]: { status: LevelStatus; bestScore: number; stars: number };
};
