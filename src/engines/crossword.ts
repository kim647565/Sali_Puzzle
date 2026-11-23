import { Level } from "../types";

export type Clue = Level["clues"][number];

export const clueId = (clue: Clue) => `${clue.number}:${clue.direction}`;

export function clueCells(clue: Clue) {
  return [...clue.answer].map((letter, index) => {
    const row = clue.row + (clue.direction === "down" ? index : 0);
    const column = clue.column + (clue.direction === "across" ? index : 0);
    return { row, column, key: `${row}:${column}`, letter };
  });
}

export function crosswordGrid(clues: Clue[]) {
  const cells = new Map<string, { row: number; column: number; letter: string; clues: Clue[]; number?: number }>();
  for (const clue of clues) {
    for (const [index, cell] of clueCells(clue).entries()) {
      const existing = cells.get(cell.key);
      if (existing && (existing.letter !== cell.letter || existing.clues.some((entry) => entry.direction === clue.direction))) {
        throw new Error(`Invalid crossword intersection at ${cell.key}`);
      }
      cells.set(cell.key, {
        ...cell, clues: [...(existing?.clues ?? []), clue], number: index === 0 ? clue.number : existing?.number,
      });
    }
  }
  return {
    cells,
    rows: Math.max(...[...cells.values()].map((cell) => cell.row)) + 1,
    columns: Math.max(...[...cells.values()].map((cell) => cell.column)) + 1,
  };
}

export function writeClue(clue: Clue, answer: string, letters: Record<string, string>, locked: Set<string>) {
  const updated = { ...letters };
  for (const [index, cell] of clueCells(clue).entries()) {
    if (locked.has(cell.key)) continue;
    const letter = answer[index];
    if (letter && letter !== " ") updated[cell.key] = letter;
    else delete updated[cell.key];
  }
  return updated;
}
