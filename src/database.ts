import * as SQLite from "expo-sqlite";
import { getLevel, levels } from "./data/levels";
import { Progress } from "./types";
import { AnswerLog, Attempt, pointsPerAnswer, Round } from "./engines/round";
import { defaultPreferences, Preferences } from "./preferences";

const database = SQLite.openDatabaseSync("sali-puzzle.db");

export function initializeDatabase() {
  database.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY NOT NULL, nickname TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, last_active_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS progress (player_id TEXT NOT NULL, level_id TEXT NOT NULL, status TEXT NOT NULL, best_score INTEGER NOT NULL DEFAULT 0, stars INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (player_id, level_id));
    CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY NOT NULL, player_id TEXT NOT NULL, level_id TEXT NOT NULL, total_score INTEGER NOT NULL, accuracy REAL NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS levels (
      id TEXT PRIMARY KEY, level_number INTEGER NOT NULL, title TEXT NOT NULL, difficulty TEXT NOT NULL,
      grid_size INTEGER NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY, level_id TEXT NOT NULL UNIQUE REFERENCES levels(id), title TEXT NOT NULL,
      objectives TEXT NOT NULL, content TEXT NOT NULL, summary TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS word_hunt_words (
      level_id TEXT NOT NULL REFERENCES levels(id), word TEXT NOT NULL, definition TEXT NOT NULL, PRIMARY KEY (level_id, word)
    );
    CREATE TABLE IF NOT EXISTS crossword_clues (
      level_id TEXT NOT NULL REFERENCES levels(id), clue_number INTEGER NOT NULL, direction TEXT NOT NULL,
      clue TEXT NOT NULL, answer TEXT NOT NULL, start_row INTEGER NOT NULL, start_column INTEGER NOT NULL, PRIMARY KEY (level_id, clue_number, direction)
    );
    CREATE TABLE IF NOT EXISTS player_progress (
      player_id TEXT NOT NULL REFERENCES players(id), level_id TEXT NOT NULL REFERENCES levels(id),
      status TEXT NOT NULL, unlocked_at TEXT, completed_at TEXT, best_score INTEGER NOT NULL DEFAULT 0,
      best_stars INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (player_id, level_id)
    );
    CREATE TABLE IF NOT EXISTS player_preferences (player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE, settings TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS game_attempts (
      id TEXT PRIMARY KEY, player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE, level_id TEXT NOT NULL REFERENCES levels(id),
      status TEXT NOT NULL CHECK(status IN ('IN_PROGRESS','COMPLETED','ABANDONED')), started_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, completed_at TEXT, round_json TEXT NOT NULL,
      word_hunt_score INTEGER NOT NULL, crossword_score INTEGER NOT NULL, total_score INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL, wrong_attempts INTEGER NOT NULL, accuracy REAL, hints_used INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL, stars INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS game_attempts_player ON game_attempts (player_id, updated_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS game_attempts_open ON game_attempts (player_id, level_id) WHERE status = 'IN_PROGRESS';
    CREATE TABLE IF NOT EXISTS answer_logs (
      id INTEGER PRIMARY KEY, attempt_id TEXT NOT NULL REFERENCES game_attempts(id) ON DELETE CASCADE,
      stage TEXT NOT NULL, submitted_answer TEXT NOT NULL, is_correct INTEGER NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS answer_logs_attempt ON answer_logs (attempt_id);
  `);
  if ((database.getFirstSync<{ user_version: number }>("PRAGMA user_version")?.user_version ?? 0) >= 1) return;
  database.withTransactionSync(() => {
    const now = new Date().toISOString();
    for (const level of levels) {
      database.runSync("INSERT INTO levels VALUES (?, ?, ?, ?, ?, ?)", level.id, level.number, level.title, level.difficulty, level.grid.length, now);
      database.runSync("INSERT INTO lessons VALUES (?, ?, ?, ?, ?, ?)", level.id, level.id, level.title, JSON.stringify(level.objectives), level.lesson, level.summary);
      for (const word of level.vocabulary) database.runSync("INSERT INTO word_hunt_words VALUES (?, ?, ?)", level.id, word.word, word.definition);
      for (const clue of level.clues) database.runSync("INSERT INTO crossword_clues VALUES (?, ?, ?, ?, ?, ?, ?)", level.id, clue.number, clue.direction, clue.clue, clue.answer, clue.row, clue.column);
    }
    database.execSync(`
      INSERT OR IGNORE INTO player_progress (player_id, level_id, status, best_score, best_stars)
      SELECT progress.player_id, progress.level_id, progress.status, progress.best_score, progress.stars
      FROM progress JOIN players ON players.id = progress.player_id JOIN levels ON levels.id = progress.level_id;
      PRAGMA user_version = 1;
    `);
  });
}

export function loadPlayers() {
  return database.getAllSync<{ id: string; nickname: string }>("SELECT id, nickname FROM players ORDER BY last_active_at DESC");
}

export function savePlayer(id: string, nickname: string) {
  const now = new Date().toISOString();
  database.runSync("INSERT INTO players (id, nickname, created_at, last_active_at) VALUES (?, ?, ?, ?)", id, nickname, now, now);
}

export function touchPlayer(id: string) {
  database.runSync("UPDATE players SET last_active_at = ? WHERE id = ?", new Date().toISOString(), id);
}

export function loadProgress(playerId: string): Progress {
  const rows = database.getAllSync<{ level_id: string; status: Progress[string]["status"]; best_score: number; stars: number }>(
    "SELECT level_id, status, best_score, best_stars AS stars FROM player_progress WHERE player_id = ?",
    playerId
  );
  return Object.fromEntries(rows.map((row) => [row.level_id, { status: row.status, bestScore: row.best_score, stars: row.stars }]));
}

function saveProgress(playerId: string, levelId: string, score: number, stars: number, timestamp: string) {
  database.runSync(
    `INSERT INTO player_progress VALUES (?, ?, 'COMPLETED', ?, ?, ?, ?)
     ON CONFLICT(player_id, level_id) DO UPDATE SET status = 'COMPLETED',
     completed_at = COALESCE(player_progress.completed_at, excluded.completed_at),
     best_score = MAX(best_score, excluded.best_score), best_stars = MAX(best_stars, excluded.best_stars)`,
    playerId, levelId, timestamp, timestamp, score, stars,
  );
  const number = getLevel(levelId)?.number;
  const next = levels.find((level) => level.number === (number ?? 0) + 1);
  if (next) database.runSync("INSERT OR IGNORE INTO player_progress (player_id, level_id, status, unlocked_at) VALUES (?, ?, 'UNLOCKED', ?)", playerId, next.id, timestamp);
}

export function clearProgress(playerId: string) {
  database.withTransactionSync(() => {
    database.runSync("DELETE FROM progress WHERE player_id = ?", playerId);
    database.runSync("DELETE FROM player_progress WHERE player_id = ?", playerId);
    database.runSync("DELETE FROM game_attempts WHERE player_id = ?", playerId);
    database.runSync("DELETE FROM attempts WHERE player_id = ?", playerId);
  });
}

export function loadPreferences(playerId: string): Preferences {
  const row = database.getFirstSync<{ settings: string }>("SELECT settings FROM player_preferences WHERE player_id = ?", playerId);
  return row ? { ...defaultPreferences, ...JSON.parse(row.settings) } : defaultPreferences;
}

export function savePreferences(playerId: string, preferences: Preferences) {
  database.runSync("INSERT INTO player_preferences VALUES (?, ?) ON CONFLICT(player_id) DO UPDATE SET settings = excluded.settings", playerId, JSON.stringify(preferences));
}

export function loadOpenRounds(playerId: string): Round[] {
  return database.getAllSync<{ round_json: string }>(
    "SELECT round_json FROM game_attempts WHERE player_id = ? AND status = 'IN_PROGRESS' ORDER BY updated_at DESC, rowid DESC", playerId,
  ).map((row) => JSON.parse(row.round_json));
}

export function saveRound(round: Round, log?: AnswerLog) {
  const now = new Date().toISOString();
  const hunt = Object.keys(round.found).length;
  const crossword = round.solved.length;
  const correct = hunt + crossword;
  const accuracy = correct + round.wrong ? 100 * correct / (correct + round.wrong) : null;
  database.withTransactionSync(() => {
    const status = round.result ? "COMPLETED" : "IN_PROGRESS";
    const written = database.runSync(
      `INSERT INTO game_attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at,
       completed_at = excluded.completed_at, round_json = excluded.round_json, word_hunt_score = excluded.word_hunt_score,
       crossword_score = excluded.crossword_score, total_score = excluded.total_score, correct_answers = excluded.correct_answers,
       wrong_attempts = excluded.wrong_attempts, accuracy = excluded.accuracy, hints_used = excluded.hints_used,
       duration_seconds = excluded.duration_seconds, stars = excluded.stars WHERE game_attempts.status = 'IN_PROGRESS'`,
      round.id, round.playerId, round.levelId, status, round.startedAt, now, round.result?.completedAt ?? null, JSON.stringify(round),
      hunt * pointsPerAnswer, crossword * pointsPerAnswer, correct * pointsPerAnswer, correct, round.wrong,
      accuracy, round.hints, Math.floor(round.elapsedMs / 1000), round.result?.stars ?? 0,
    );
    if (!written.changes) return;
    if (log) database.runSync("INSERT INTO answer_logs (attempt_id, stage, submitted_answer, is_correct, created_at) VALUES (?, ?, ?, ?, ?)", round.id, log.stage, log.answer, Number(log.correct), now);
    if (round.result) {
      saveProgress(round.playerId, round.levelId, round.result.score, round.result.stars, round.result.completedAt);
    } else {
      database.runSync(
        `INSERT INTO player_progress (player_id, level_id, status, unlocked_at) VALUES (?, ?, 'IN_PROGRESS', ?)
         ON CONFLICT(player_id, level_id) DO UPDATE SET status = 'IN_PROGRESS' WHERE player_progress.status <> 'COMPLETED'`,
        round.playerId, round.levelId, round.startedAt,
      );
    }
  });
}

export function abandonRound(round: Round) {
  database.withTransactionSync(() => {
    database.runSync("UPDATE game_attempts SET status = 'ABANDONED', updated_at = ? WHERE id = ? AND player_id = ? AND status = 'IN_PROGRESS'", new Date().toISOString(), round.id, round.playerId);
    database.runSync("UPDATE player_progress SET status = 'UNLOCKED' WHERE player_id = ? AND level_id = ? AND status = 'IN_PROGRESS'", round.playerId, round.levelId);
  });
}

export function loadAttempts(playerId: string): Attempt[] {
  return database.getAllSync<Attempt>(
    `SELECT id, level_id AS levelId, status, started_at AS startedAt, completed_at AS completedAt,
     word_hunt_score AS wordHuntScore, crossword_score AS crosswordScore, total_score AS score, correct_answers AS correct,
     wrong_attempts AS wrong, accuracy, hints_used AS hints, duration_seconds AS duration, stars
     FROM game_attempts WHERE player_id = ? ORDER BY updated_at DESC, rowid DESC`, playerId,
  );
}

export function loadEarnedPoints(playerId: string) {
  return database.getFirstSync<{ points: number }>(`
    SELECT
      (SELECT COALESCE(SUM(total_score), 0) FROM game_attempts WHERE player_id = ? AND status = 'COMPLETED') +
      (SELECT COALESCE(SUM(best_score), 0) FROM progress WHERE player_id = ? AND status = 'COMPLETED')
      AS points
  `, playerId, playerId)?.points ?? 0;
}
