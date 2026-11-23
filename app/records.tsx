import { useCallback, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { Button } from "../src/components/Button";
import { PuzzleButton, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { getLevel, isLevelUnlocked, levels } from "../src/data/levels";
import { loadAttempts, loadEarnedPoints } from "../src/database";
import { recordsCsv } from "../src/engines/recordsCsv";
import { Attempt, formatDuration } from "../src/engines/round";
import { useAppStore } from "../src/store";

const labels = { COMPLETED: "Completed", IN_PROGRESS: "In progress", ABANDONED: "Reset" };
const levelTitle = (id: string) => getLevel(id)?.title ?? id;
const accuracyText = (accuracy: number | null) => accuracy === null ? "N/A" : `${Math.round(accuracy)}%`;

export default function Records() {
  const player = useAppStore((state) => state.player);
  const progress = useAppStore((state) => state.progress);
  const [history, setHistory] = useState<{ playerId: string; entries: Attempt[]; earned: number }>();
  const [expanded, setExpanded] = useState<string>();
  const [exporting, setExporting] = useState(false);
  const exportInProgress = useRef(false);
  const [message, setMessage] = useState("");
  useFocusEffect(useCallback(() => {
    if (player) setHistory({ playerId: player.id, entries: loadAttempts(player.id), earned: loadEarnedPoints(player.id) });
  }, [player]));

  if (!player) return <Screen><Text>Choose a player to see their records.</Text><PuzzleButton onPress={() => router.push("/login")}>Choose a player</PuzzleButton></Screen>;
  const loaded = history?.playerId === player.id ? history : undefined;
  const attempts = loaded?.entries ?? [];
  const completed = levels.filter((level) => progress[level.id]?.status === "COMPLETED");
  const current = levels.find((level) => isLevelUnlocked(level, progress) && progress[level.id]?.status !== "COMPLETED");
  const finished = attempts.filter((attempt) => attempt.status === "COMPLETED");
  const rated = finished.filter((attempt) => attempt.accuracy !== null);
  const average = rated.length ? rated.reduce((sum, attempt) => sum + (attempt.accuracy ?? 0), 0) / rated.length : null;
  const points = loaded?.earned ?? 0;
  const playtime = attempts.reduce((sum, attempt) => sum + attempt.duration, 0);
  const chart = levels.flatMap((level) => {
    const entries = attempts.filter((attempt) => attempt.levelId === level.id);
    if (!entries.length) return [];
    return [{
      level, correct: entries.reduce((sum, attempt) => sum + attempt.correct, 0), wrong: entries.reduce((sum, attempt) => sum + attempt.wrong, 0),
    }];
  });
  const maxSubmissions = Math.max(1, ...chart.map((row) => row.correct + row.wrong));

  async function share() {
    if (!player || !attempts.length || exportInProgress.current) return;
    exportInProgress.current = true;
    setExporting(true);
    setMessage("");
    try {
      if (!await Sharing.isAvailableAsync()) {
        setMessage("CSV sharing is unavailable on this device.");
        return;
      }
      const file = new File(Paths.cache, `sali-puzzle-records-${player.id}-${Date.now()}.csv`);
      file.create();
      await file.write(recordsCsv(player, attempts, levelTitle));
      await Sharing.shareAsync(file.uri, { mimeType: "text/csv", dialogTitle: "Share Sali Puzzle records" });
    } catch {
      setMessage("Couldn’t export the records. Try again.");
    } finally {
      exportInProgress.current = false;
      setExporting(false);
    }
  }

  return <Screen background={puzzle.paper}>
    <Text accessibilityRole="header" style={puzzleText.title}>Your records</Text>
    <View style={styles.summary}>
      <Text style={puzzleText.heading}>{player.nickname}</Text>
      <Text style={puzzleText.body}>{current ? `Current level ${current.number}` : "All levels complete"}</Text>
      <View style={styles.metrics}>
        {[
          [String(completed.length), "Completed levels"], [String(points), "Points earned"],
          [accuracyText(average), "Average accuracy"], [formatDuration(playtime), "Total playtime"], [String(attempts.length), "Attempts"],
        ].map(([value, label]) => <View key={label} style={styles.metric}><Text style={puzzleText.heading}>{value}</Text><Text style={puzzleText.body}>{label}</Text></View>)}
      </View>
    </View>
    {attempts.length > 0 && <Button disabled={exporting} onPress={() => void share()}>{exporting ? "Preparing CSV…" : "Export records as CSV"}</Button>}
    {message !== "" && <Text accessibilityLiveRegion="polite" style={puzzleText.body}>{message}</Text>}
    {chart.some((row) => row.correct + row.wrong > 0) && <View style={styles.panel}>
      <Text accessibilityRole="header" style={puzzleText.heading}>Answers by level</Text>
      {chart.map(({ level, correct, wrong }) => <View key={level.id} style={styles.chartRow} accessible accessibilityLabel={`Level ${level.number}, ${correct} correct, ${wrong} incorrect`}>
        <Text style={puzzleText.label}>Level {level.number}</Text>
        <View style={styles.track}>
          <View style={[styles.correctBar, { width: `${100 * correct / maxSubmissions}%` }]} />
          <View style={[styles.wrongBar, { width: `${100 * wrong / maxSubmissions}%` }]} />
        </View>
        <Text style={puzzleText.body}>{correct} correct • {wrong} incorrect</Text>
      </View>)}
    </View>}
    {completed.length > 0 && <View style={styles.panel}>
      <Text accessibilityRole="header" style={puzzleText.heading}>Best scores</Text>
      {completed.map((level) => <View key={level.id} style={styles.recordHeader}>
        <Text style={styles.level}>{level.title}</Text>
        <Text style={puzzleText.body}>{progress[level.id].bestScore} pts • {progress[level.id].stars} stars</Text>
      </View>)}
    </View>}
    <Text accessibilityRole="header" style={puzzleText.heading}>Attempt history</Text>
    {attempts.length === 0 && <View style={styles.panel}><Text style={puzzleText.body}>Start a puzzle to see your attempts here.</Text></View>}
    {attempts.map((attempt) => {
      const open = expanded === attempt.id;
      return <View key={attempt.id} style={styles.panel}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setExpanded(open ? undefined : attempt.id)}>
          <Text style={puzzleText.label}>{levelTitle(attempt.levelId)}</Text>
          <Text style={puzzleText.body}>{new Date(attempt.completedAt ?? attempt.startedAt).toLocaleDateString()} • {labels[attempt.status]}</Text>
          <Text style={puzzleText.body}>{attempt.score} pts • {accuracyText(attempt.accuracy)} accuracy • {formatDuration(attempt.duration)}</Text>
        </Pressable>
        {open && <View style={styles.details}>
          <Text style={puzzleText.body}>Word Hunt {attempt.wordHuntScore} pts • Crossword {attempt.crosswordScore} pts</Text>
          <Text style={puzzleText.body}>{attempt.correct} correct • {attempt.wrong} incorrect • {attempt.hints} hints</Text>
          {attempt.status === "COMPLETED" && <Text style={puzzleText.label}>{attempt.stars} of 3 stars</Text>}
        </View>}
      </View>;
    })}
    <PuzzleButton quiet onPress={() => router.dismissTo("/home")}>Back home</PuzzleButton>
  </Screen>;
}

const styles = StyleSheet.create({
  summary: { borderRadius: 20, backgroundColor: puzzle.sunshine, padding: 14, gap: 6 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  metric: { flexGrow: 1, flexBasis: "42%", backgroundColor: puzzle.paper, borderRadius: 10, padding: 8 },
  panel: { borderRadius: 15, padding: 13, backgroundColor: puzzle.white, gap: 8 },
  recordHeader: { flexDirection: "row", flexWrap: "wrap", gap: 5, justifyContent: "space-between", alignItems: "center" },
  level: { flexShrink: 1, color: puzzle.ink, fontWeight: "800" },
  chartRow: { gap: 4 },
  track: { flexDirection: "row", height: 11, backgroundColor: puzzle.paper, borderRadius: 6, overflow: "hidden" },
  correctBar: { backgroundColor: puzzle.success },
  wrongBar: { backgroundColor: puzzle.error },
  details: { borderTopWidth: 1, borderTopColor: puzzle.lilac, paddingTop: 6 },
});
