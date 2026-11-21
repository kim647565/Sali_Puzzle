import * as SQLite from "expo-sqlite";
import { Progress } from "./types";

const database = SQLite.openDatabaseSync("sali-puzzle.db");

export function initializeDatabase() {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY NOT NULL, nickname TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, last_active_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS progress (player_id TEXT NOT NULL, level_id TEXT NOT NULL, status TEXT NOT NULL, best_score INTEGER NOT NULL DEFAULT 0, stars INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (player_id, level_id));
    CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY NOT NULL, player_id TEXT NOT NULL, level_id TEXT NOT NULL, total_score INTEGER NOT NULL, accuracy REAL NOT NULL, created_at TEXT NOT NULL);
  `);
}

export function loadPlayers() {
  return database.getAllSync<{ id: string; nickname: string }>("SELECT id, nickname FROM players ORDER BY last_active_at DESC");
}

export function savePlayer(id: string, nickname: string) {
  const now = new Date().toISOString();
  database.runSync("INSERT OR REPLACE INTO players (id, nickname, created_at, last_active_at) VALUES (?, ?, COALESCE((SELECT created_at FROM players WHERE id = ?), ?), ?)", id, nickname, id, now, now);
}

export function touchPlayer(id: string) {
  database.runSync("UPDATE players SET last_active_at = ? WHERE id = ?", new Date().toISOString(), id);
}

export function loadProgress(playerId: string): Progress {
  const rows = database.getAllSync<{ level_id: string; status: Progress[string]["status"]; best_score: number; stars: number }>(
    "SELECT level_id, status, best_score, stars FROM progress WHERE player_id = ?",
    playerId
  );
  return Object.fromEntries(rows.map((row) => [row.level_id, { status: row.status, bestScore: row.best_score, stars: row.stars }]));
}

export function saveProgress(playerId: string, levelId: string, score: number, stars: number) {
  database.runSync(
    "INSERT INTO progress (player_id, level_id, status, best_score, stars) VALUES (?, ?, 'COMPLETED', ?, ?) ON CONFLICT(player_id, level_id) DO UPDATE SET status = 'COMPLETED', best_score = MAX(best_score, excluded.best_score), stars = MAX(stars, excluded.stars)",
    playerId,
    levelId,
    score,
    stars
  );
}

export function clearProgress(playerId: string) {
  database.runSync("DELETE FROM progress WHERE player_id = ?", playerId);
}
