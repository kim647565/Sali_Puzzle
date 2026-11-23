let mockCompletionFailure = false;

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: () => {
    const { DatabaseSync } = require("node:sqlite");
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE players (id TEXT PRIMARY KEY NOT NULL, nickname TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, last_active_at TEXT NOT NULL);
      CREATE TABLE progress (player_id TEXT NOT NULL, level_id TEXT NOT NULL, status TEXT NOT NULL, best_score INTEGER NOT NULL, stars INTEGER NOT NULL, PRIMARY KEY (player_id, level_id));
      INSERT INTO players VALUES ('legacy', 'Legacy player', '2025-01-01', '2025-01-01');
      INSERT INTO progress VALUES ('legacy', 'plants', 'COMPLETED', 500, 2);
    `);
    return {
      execSync: (sql) => db.exec(sql),
      runSync: (sql, ...args) => {
        if (mockCompletionFailure && sql.includes("INSERT INTO player_progress") && sql.includes("completed_at =")) throw new Error("Simulated storage failure");
        return db.prepare(sql).run(...args);
      },
      getFirstSync: (sql, ...args) => db.prepare(sql).get(...args),
      getAllSync: (sql, ...args) => db.prepare(sql).all(...args),
      withTransactionSync: (task) => {
        db.exec("BEGIN");
        try {
          task();
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
    };
  },
}));

const database = require("../src/database");
const { hydratePlayers, useAppStore } = require("../src/store");
const { levels } = require("../src/data/levels");
const { findWordStart, selectionToWord } = require("../src/engines/wordHunt");
const { clueId } = require("../src/engines/crossword");
const { recordsCsv } = require("../src/engines/recordsCsv");
const state = useAppStore.getState;

beforeAll(() => {
  database.initializeDatabase();
  database.initializeDatabase();
  hydratePlayers();
});

function submitWord(level, word, backwards = false) {
  const start = findWordStart(level.grid, word, level.difficulty !== "Easy");
  const cells = level.grid.flatMap((row, r) => row.map((_, column) => ({ row: r, column })));
  const end = cells.find((cell) => (level.difficulty !== "Easy" || cell.row === start.row || cell.column === start.column) && selectionToWord(level.grid, start, cell)?.word === word);
  return backwards ? state().submitWord(end, start) : state().submitWord(start, end);
}

test("migrates legacy best scores without inventing attempt history", () => {
  expect(database.loadProgress("legacy").plants).toEqual({ status: "COMPLETED", bestScore: 500, stars: 2 });
  expect(database.loadAttempts("legacy")).toHaveLength(0);
  expect(database.loadEarnedPoints("legacy")).toBe(500);
});

test("profiles, resumption, stage gates, completion, export, and progress reset", () => {
  expect(state().createPlayer("")).toBe(false);
  expect(state().createPlayer('=Learner, "One"')).toBe(true);
  expect(state().createPlayer(' =learner, "one" ')).toBe(false);
  const first = state().player;
  const level = levels[0];
  expect(state().startRound(levels[1].id)).toBe(false);
  expect(state().startRound(level.id)).toBe(true);
  const attemptId = state().round.id;
  expect(state().submitClue(clueId(level.clues[0]), level.clues[0].answer)).toBe("incomplete");
  expect(state().submitWord({ row: 0, column: 0 }, { row: 0, column: 1 })).toBe("wrong");
  expect(submitWord(level, level.huntWords[0], true)).toBe("correct");
  expect(submitWord(level, level.huntWords[0])).toBe("duplicate");
  state().useHint();
  state().setPaused(true);
  state().setPreference("backgroundMusic", true);
  state().setPreference("tutorialSeen", true);
  hydratePlayers();
  expect(state().round).toMatchObject({ id: attemptId, paused: true, hints: 1 });
  expect(state().preferences).toMatchObject({ backgroundMusic: true, tutorialSeen: true });
  state().setPaused(false);
  for (const word of level.huntWords.slice(1)) expect(submitWord(level, word)).toBe("correct");
  const [clue] = level.clues;
  expect(state().submitClue(clueId(clue), "Z".repeat(clue.answer.length))).toBe("wrong");
  expect(state().finishRound(level.id)).toBe(false);
  for (const item of level.clues) expect(state().submitClue(clueId(item), item.answer)).toBe("correct");
  mockCompletionFailure = true;
  try {
    expect(() => state().finishRound(level.id)).toThrow("Simulated storage failure");
    expect(database.loadAttempts(first.id)[0].status).toBe("IN_PROGRESS");
    expect(state().startRound(levels[1].id)).toBe(false);
  } finally {
    mockCompletionFailure = false;
  }
  expect(state().finishRound(level.id)).toBe(true);
  expect(state().finishRound(level.id)).toBe(true);
  const [attempt, extra] = database.loadAttempts(first.id);
  expect(extra).toBeUndefined();
  expect(attempt).toMatchObject({ id: attemptId, status: "COMPLETED", score: 600, correct: 6, wrong: 2, hints: 1, stars: 2 });
  expect(recordsCsv(first, [attempt], () => level.title)).toContain('"\'=Learner, ""One"""');
  expect(recordsCsv(first, [attempt], () => level.title).trim().split("\r\n")).toHaveLength(2);
  expect(state().startRound(levels[1].id)).toBe(true);
  state().resetRound();
  expect(database.loadAttempts(first.id).some((item) => item.status === "ABANDONED")).toBe(true);
  expect(state().createPlayer("Second")).toBe(true);
  expect(database.loadAttempts(state().player.id)).toHaveLength(0);
  expect(state().startRound(levels[1].id)).toBe(false);
  expect(state().preferences.backgroundMusic).toBe(false);
  state().setPlayer(first);
  state().resetProgress();
  expect(database.loadProgress(first.id)).toEqual({});
  expect(database.loadAttempts(first.id)).toHaveLength(0);
  expect(database.loadEarnedPoints(first.id)).toBe(0);
  expect(database.loadProgress("legacy").plants.bestScore).toBe(500);
});

test("the saved play clock excludes time spent paused", () => {
  expect(state().startRound(levels[0].id)).toBe(true);
  const now = jest.spyOn(Date, "now");
  try {
    now.mockReturnValue(1000);
    state().setClockRunning(true);
    now.mockReturnValue(5500);
    state().setPaused(true);
    now.mockReturnValue(15000);
    state().checkpoint();
    expect(state().round.elapsedMs).toBe(4500);
    state().setPaused(false);
    state().setClockRunning(true);
    now.mockReturnValue(16800);
    state().setClockRunning(false);
    expect(database.loadOpenRounds(state().player.id)[0].elapsedMs).toBe(6300);
  } finally {
    now.mockRestore();
  }
});
