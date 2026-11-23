import { create } from "zustand";
import { Progress } from "./types";
import { abandonRound, clearProgress, loadOpenRounds, loadPlayers, loadPreferences, loadProgress, savePlayer, savePreferences, saveRound, touchPlayer } from "./database";
import { getLevel, isLevelUnlocked } from "./data/levels";
import { Cell, selectionToWord } from "./engines/wordHunt";
import { AnswerLog, Round, scoreRound } from "./engines/round";
import { clueId, writeClue } from "./engines/crossword";
import { defaultPreferences, Preferences } from "./preferences";

type Player = { id: string; nickname: string };
type AppState = {
  player: Player | null;
  ready: boolean;
  players: Player[];
  progress: Progress;
  preferences: Preferences;
  round: Round | null;
  clockAt: number | null;
  setPlayer: (player: Player) => void;
  createPlayer: (nickname: string) => boolean;
  setPreference: (key: keyof Preferences, value: boolean) => void;
  startRound: (levelId: string) => boolean;
  setClockRunning: (running: boolean) => void;
  checkpoint: () => void;
  setPaused: (paused: boolean) => void;
  submitWord: (start: Cell, end: Cell) => "invalid" | "wrong" | "duplicate" | "correct";
  useHint: () => void;
  writeLetters: (letters: Record<string, string>, hinted?: boolean) => void;
  submitClue: (id: string, answer: string) => "incomplete" | "wrong" | "correct";
  finishRound: (levelId: string) => boolean;
  resetRound: () => void;
  resetProgress: () => void;
};

function playerData(player: Player | null) {
  return {
    player,
    progress: player ? loadProgress(player.id) : {},
    preferences: player ? loadPreferences(player.id) : defaultPreferences,
    round: player ? loadOpenRounds(player.id)[0] ?? null : null,
    clockAt: null,
  };
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export const useAppStore = create<AppState>((set, get) => {
  function save(round: Round, log?: AnswerLog, stop = false) {
    const { clockAt } = get();
    const now = Date.now();
    const snapshot = clockAt === null ? round : { ...round, elapsedMs: round.elapsedMs + Math.max(0, now - clockAt) };
    saveRound(snapshot, log);
    set({ round: snapshot, clockAt: stop || clockAt === null ? null : now });
  }

  return {
    player: null, ready: false, players: [], progress: {}, preferences: defaultPreferences, round: null, clockAt: null,
    setPlayer: (player) => {
      get().setClockRunning(false);
      touchPlayer(player.id);
      set(playerData(player));
    },
    createPlayer: (nickname) => {
      const normalized = nickname.trim();
      if (!normalized || get().players.some((item) => item.nickname.toLowerCase() === normalized.toLowerCase())) return false;
      get().setClockRunning(false);
      const player = { id: newId(), nickname: normalized };
      savePlayer(player.id, player.nickname);
      set((state) => ({ ...playerData(player), players: [player, ...state.players] }));
      return true;
    },
    setPreference: (key, value) => {
      const { player, preferences } = get();
      if (!player) return;
      const updated = { ...preferences, [key]: value };
      savePreferences(player.id, updated);
      set({ preferences: updated });
    },
    startRound: (levelId) => {
      const { player, progress, round } = get();
      const level = getLevel(levelId);
      if (!player || !level || !isLevelUnlocked(level, progress)) return false;
      if (round?.levelId === levelId && !round.result) return true;
      get().setClockRunning(false);
      const existing = loadOpenRounds(player.id).find((item) => item.levelId === levelId);
      save(existing ?? {
        id: newId(), playerId: player.id, levelId, startedAt: new Date().toISOString(),
        elapsedMs: 0, paused: false, found: {}, solved: [], letters: {}, wrong: 0, hints: 0,
      });
      return true;
    },
    setClockRunning: (running) => {
      const { round, clockAt } = get();
      if (!round || round.result) return;
      if (running && !round.paused && clockAt === null) set({ clockAt: Date.now() });
      else if (!running && clockAt !== null) save(round, undefined, true);
    },
    checkpoint: () => {
      const { round, clockAt } = get();
      if (round && !round.result && clockAt !== null) save(round);
    },
    setPaused: (paused) => {
      const { round } = get();
      if (round && !round.result) save({ ...round, paused }, undefined, paused);
    },
    submitWord: (start, end) => {
      const { round } = get();
      const level = round && getLevel(round.levelId);
      if (!round || !level || round.result || round.paused || Object.keys(round.found).length === level.huntWords.length) return "invalid";
      if (level.difficulty === "Easy" && start.row !== end.row && start.column !== end.column) return "invalid";
      const selection = selectionToWord(level.grid, start, end);
      if (!selection) return "invalid";
      const reverse = [...selection.word].reverse().join("");
      const word = level.huntWords.includes(selection.word) ? selection.word : reverse;
      if (!level.huntWords.includes(word)) {
        save({ ...round, wrong: round.wrong + 1 }, { stage: "word-hunt", answer: selection.word, correct: false });
        return "wrong";
      }
      if (round.found[word]) return "duplicate";
      save({ ...round, found: { ...round.found, [word]: selection.cells } }, { stage: "word-hunt", answer: selection.word, correct: true });
      return "correct";
    },
    useHint: () => {
      const { round } = get();
      if (round && !round.result && !round.paused) save({ ...round, hints: round.hints + 1 });
    },
    writeLetters: (letters, hinted = false) => {
      const { round } = get();
      if (round && !round.result && !round.paused) save({ ...round, letters, hints: round.hints + Number(hinted) });
    },
    submitClue: (id, answer) => {
      const { round } = get();
      const level = round && getLevel(round.levelId);
      if (!round || !level || round.result || round.paused || !level.huntWords.every((word) => round.found[word])) return "incomplete";
      const clue = level.clues.find((item) => clueId(item) === id);
      if (!clue || answer.length !== clue.answer.length) return "incomplete";
      if (round.solved.includes(id)) return "correct";
      const correct = answer === clue.answer;
      save(correct
        ? { ...round, solved: [...round.solved, id], letters: writeClue(clue, answer, round.letters, new Set()) }
        : { ...round, wrong: round.wrong + 1 }, { stage: "crossword", answer, correct });
      return correct ? "correct" : "wrong";
    },
    finishRound: (levelId) => {
      const { player, round, progress } = get();
      const level = getLevel(levelId);
      if (!player || !level || round?.playerId !== player.id || round.levelId !== levelId) return false;
      if (!level.huntWords.every((word) => round.found[word]) || !level.clues.every((clue) => round.solved.includes(clueId(clue)))) return false;
      if (round.result) return true;
      const result = scoreRound(round, new Date().toISOString());
      save({ ...round, result }, undefined, true);
      const best = progress[levelId];
      set({ progress: { ...progress, [levelId]: { status: "COMPLETED", bestScore: Math.max(result.score, best?.bestScore ?? 0), stars: Math.max(result.stars, best?.stars ?? 0) } } });
      return true;
    },
    resetRound: () => {
      get().setClockRunning(false);
      const { player, round } = get();
      if (!player || !round || round.result) return;
      abandonRound(round);
      set({ round: loadOpenRounds(player.id)[0] ?? null, clockAt: null });
    },
    resetProgress: () => {
      const player = get().player;
      if (player) clearProgress(player.id);
      set({ progress: {}, round: null, clockAt: null });
    },
  };
});

export function hydratePlayers() {
  const players = loadPlayers();
  useAppStore.setState({ ready: true, players, ...playerData(players[0] ?? null) });
}
