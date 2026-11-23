import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDuration, Round } from "../engines/round";
import { useAppStore } from "../store";
import { PuzzleButton, puzzle, puzzleText } from "./PuzzleScreen";

export function RoundControls({ round }: { round: Round }) {
  const clockAt = useAppStore((state) => state.clockAt);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (clockAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [clockAt]);
  const seconds = Math.floor((round.elapsedMs + (clockAt === null ? 0 : Math.max(0, now - clockAt))) / 1000);
  return (
    <View style={styles.row}>
      <View style={styles.clock}>
        <Ionicons name="time-outline" size={19} color={puzzle.grape} />
        <Text accessibilityLabel={`${Math.floor(seconds / 60)} minutes, ${seconds % 60} seconds played`} style={puzzleText.label}>{formatDuration(seconds)}</Text>
      </View>
      {!round.result && <Pressable accessibilityRole="button" onPress={() => useAppStore.getState().setPaused(!round.paused)} style={({ pressed }) => [styles.pause, pressed && styles.pressed]}>
        <Ionicons name={round.paused ? "play" : "pause"} size={17} color={puzzle.grape} />
        <Text style={puzzleText.label}>{round.paused ? "Resume" : "Pause"}</Text>
      </Pressable>}
    </View>
  );
}

export function PausedRound() {
  return <View style={styles.panel}>
    <Text style={puzzleText.heading}>Puzzle paused</Text>
    <Text style={puzzleText.body}>Your answers are saved on this device.</Text>
    <PuzzleButton onPress={() => useAppStore.getState().setPaused(false)}>Resume puzzle</PuzzleButton>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  clock: { flexDirection: "row", alignItems: "center", gap: 6 },
  pause: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 44, paddingHorizontal: 12, backgroundColor: puzzle.lilac, borderRadius: 12 },
  pressed: { opacity: 0.72 },
  panel: { padding: 18, gap: 12, backgroundColor: puzzle.white, borderRadius: 17 },
});
