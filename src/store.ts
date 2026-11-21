import { create } from "zustand";
import { Progress } from "./types";
import { clearProgress, loadPlayers, loadProgress, savePlayer, saveProgress, touchPlayer } from "./database";

type Player = { id: string; nickname: string };
type AppState = {
  player: Player | null;
  players: Player[];
  progress: Progress;
  setPlayer: (player: Player) => void;
  createPlayer: (nickname: string) => boolean;
  completeLevel: (levelId: string, score: number, stars: number) => void;
  resetProgress: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  player: null,
  players: [],
  progress: {},
  setPlayer: (player) => { touchPlayer(player.id); set({ player, progress: loadProgress(player.id) }); },
  createPlayer: (nickname) => {
    const normalized = nickname.trim();
    if (!normalized || get().players.some((item) => item.nickname.toLowerCase() === normalized.toLowerCase())) return false;
    const player = { id: `${Date.now()}`, nickname: normalized };
    savePlayer(player.id, player.nickname);
    set((state) => ({ player, players: [player, ...state.players] }));
    return true;
  },
  completeLevel: (levelId, score, stars) => {
    const player = get().player;
    if (player) saveProgress(player.id, levelId, score, stars);
    set((state) => ({
      progress: { ...state.progress, [levelId]: { status: "COMPLETED", bestScore: Math.max(score, state.progress[levelId]?.bestScore ?? 0), stars: Math.max(stars, state.progress[levelId]?.stars ?? 0) } }
    }));
  },
  resetProgress: () => {
    const player = get().player;
    if (player) clearProgress(player.id);
    set({ progress: {} });
  }
}));

export function hydratePlayers() {
  const players = loadPlayers();
  const last = players[0] ?? null;
  useAppStore.setState({ players, player: last, progress: last ? loadProgress(last.id) : {} });
}
