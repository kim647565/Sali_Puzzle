import { router } from "expo-router";
import Constants from "expo-constants";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { PuzzleButton, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { getLevel } from "../src/data/levels";
import { Preferences } from "../src/preferences";
import { useAppStore } from "../src/store";

const controls = [
  { key: "soundEffects", label: "Sound effects", description: "Play a quick sound for correct and incorrect answers." },
  { key: "backgroundMusic", label: "Background music", description: "Play music while solving puzzles." },
  { key: "haptics", label: "Haptic feedback", description: "Feel a short vibration when you check an answer." },
] as const satisfies readonly { key: keyof Preferences; label: string; description: string }[];

export default function Settings() {
  const preferences = useAppStore((state) => state.preferences);
  const player = useAppStore((state) => state.player);
  const round = useAppStore((state) => state.round);
  const active = round && !round.result ? getLevel(round.levelId) : undefined;
  const change = useAppStore((state) => state.setPreference);

  function resetPuzzle() {
    if (!active) return;
    Alert.alert("Reset this puzzle?", `Start ${active.title} over and keep any completed scores.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Reset puzzle", style: "destructive", onPress: () => useAppStore.getState().resetRound() },
    ]);
  }

  function resetProgress() {
    if (!player) return;
    Alert.alert("Reset player progress?", `Remove saved games, scores, and attempt history for ${player.nickname} from this device.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Reset progress", style: "destructive", onPress: () => useAppStore.getState().resetProgress() },
    ]);
  }

  return <Screen background={puzzle.paper}>
    <Text accessibilityRole="header" style={puzzleText.title}>Settings</Text>
    <View style={styles.panel}>
      {controls.map(({ key, label, description }) => (
        <View style={styles.row} key={key}>
          <View style={styles.copy}><Text style={puzzleText.label}>{label}</Text><Text style={puzzleText.body}>{description}</Text></View>
          <Switch accessibilityLabel={label} disabled={!player} value={preferences[key]} onValueChange={(value) => change(key, value)} trackColor={{ true: puzzle.grape, false: puzzle.lilac }} />
        </View>
      ))}
    </View>
    <PuzzleButton quiet onPress={() => router.push("/how-to-play")}>Replay how to play</PuzzleButton>
    <PuzzleButton quiet onPress={() => router.push("/login")}>Switch player</PuzzleButton>
    {active && <PuzzleButton quiet onPress={resetPuzzle}>Reset current puzzle</PuzzleButton>}
    {player && <PuzzleButton quiet onPress={resetProgress}>Reset player progress</PuzzleButton>}
    <View style={styles.panel}>
      <Text style={puzzleText.heading}>About Sali Puzzle</Text>
      <Text style={puzzleText.body}>Play lesson-based word puzzles and view your progress offline.</Text>
      <Text style={puzzleText.label}>Version {Constants.expoConfig?.version ?? "1.0.0"}</Text>
    </View>
    <PuzzleButton onPress={() => router.dismissTo("/home")}>Back home</PuzzleButton>
  </Screen>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: puzzle.white, borderRadius: 17, padding: 14, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  copy: { flex: 1, gap: 2 },
});
