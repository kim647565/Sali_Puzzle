import { Attempt } from "./round";

function cell(value: string | number | null) {
  const raw = String(value ?? "");
  const safe = typeof value === "string" && /^[\s]*[=+\-@]|^[\t\r\n]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function recordsCsv(player: { id: string; nickname: string }, attempts: Attempt[], titleFor: (id: string) => string) {
  const columns = ["Player ID", "Nickname", "Level ID", "Level name", "Attempt ID", "Status", "Started at", "Completed at", "Word Hunt score", "Crossword score", "Total score", "Correct submissions", "Incorrect submissions", "Accuracy percent", "Hints used", "Duration seconds", "Stars"];
  const rows = attempts.map((attempt) => [
    player.id, player.nickname, attempt.levelId, titleFor(attempt.levelId), attempt.id, attempt.status, attempt.startedAt,
    attempt.completedAt, attempt.wordHuntScore, attempt.crosswordScore, attempt.score, attempt.correct, attempt.wrong,
    attempt.accuracy === null ? null : Number(attempt.accuracy.toFixed(2)), attempt.hints, attempt.duration, attempt.stars,
  ]);
  return [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
