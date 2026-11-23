import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { PuzzleButton, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { Screen } from "../src/components/Screen";
import { isLevelUnlocked, levels } from "../src/data/levels";
import { loadOpenRounds } from "../src/database";
import { useAppStore } from "../src/store";

export default function Levels() {
  const { browse } = useLocalSearchParams<{ browse?: string }>();
  const lessons = browse === "lessons";
  const player = useAppStore((state) => state.player);
  const progress = useAppStore((state) => state.progress);
  const [unfinished, setUnfinished] = useState<{ playerId: string; ids: string[] }>();
  useFocusEffect(useCallback(() => {
    if (player) setUnfinished({ playerId: player.id, ids: loadOpenRounds(player.id).map((round) => round.levelId) });
  }, [player]));

  return <Screen background={puzzle.paper}>
    <Text accessibilityRole="header" style={puzzleText.title}>{lessons ? "Lessons" : "The learning trail"}</Text>
    <Text style={puzzleText.body}>{lessons ? "Pick an unlocked level to read its lesson." : "Each solved level opens the next challenge."}</Text>
    {levels.map((level) => {
      const record = progress[level.id];
      const unlocked = isLevelUnlocked(level, progress);
      const completed = record?.status === "COMPLETED";
      const ongoing = unfinished?.playerId === player?.id && unfinished?.ids.includes(level.id);
      return <View key={level.id} style={[styles.level, completed && styles.complete]}>
        <View style={styles.top}>
          <View style={styles.copy}>
            <Text style={puzzleText.label}>Level {level.number} / {level.difficulty}</Text>
            <Text style={puzzleText.heading}>{level.title}</Text>
          </View>
          <Ionicons name={!unlocked ? "lock-closed" : ongoing ? "time-outline" : completed ? "checkmark-circle" : "lock-open-outline"} size={23} color={puzzle.grape} />
        </View>
        <Text style={puzzleText.body}>{!unlocked ? "Locked" : ongoing ? "In progress" : completed ? "Completed" : "Unlocked"}</Text>
        {completed && <Text style={puzzleText.label}>{record.bestScore} best points • {record.stars} of 3 stars</Text>}
        {unlocked && <PuzzleButton onPress={() => router.push(`/lesson/${level.id}`)}>{lessons ? "Read lesson" : ongoing ? "Continue level" : completed ? "Replay level" : "Open lesson"}</PuzzleButton>}
      </View>;
    })}
    <PuzzleButton quiet onPress={() => router.dismissTo("/home")}>Back home</PuzzleButton>
  </Screen>;
}

const styles = StyleSheet.create({
  level: { padding: 13, borderRadius: 16, backgroundColor: puzzle.white, borderWidth: 1, borderColor: puzzle.lilac, gap: 6 },
  complete: { backgroundColor: puzzle.mint },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  copy: { flex: 1, gap: 2 },
});
