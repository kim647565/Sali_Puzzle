import { Redirect, router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { PuzzleButton, puzzle, puzzleText } from "../src/components/PuzzleScreen";
import { getLevel, isLevelUnlocked, levels } from "../src/data/levels";
import { loadEarnedPoints } from "../src/database";
import { useAppStore } from "../src/store";
import { fonts } from "../src/theme";

const shortcuts = [
  { label: "How to play", icon: "help-buoy-outline", route: "/how-to-play", color: puzzle.lilac },
  { label: "View records", icon: "bar-chart-outline", route: "/records", color: puzzle.sunshine },
  { label: "Settings", icon: "options-outline", route: "/settings", color: puzzle.mint },
  { label: "Switch player", icon: "people-outline", route: "/login", color: puzzle.blush },
] as const satisfies readonly { label: string; icon: ComponentProps<typeof Ionicons>["name"]; route: string; color: string }[];

export default function Home() {
  const player = useAppStore((state) => state.player);
  const progress = useAppStore((state) => state.progress);
  const round = useAppStore((state) => state.round);
  const ready = useAppStore((state) => state.ready);
  const [total, setTotal] = useState<{ playerId: string; points: number }>();
  useFocusEffect(useCallback(() => {
    if (player) setTotal({
      playerId: player.id,
      points: loadEarnedPoints(player.id),
    });
  }, [player]));
  if (!ready) return <Screen background={puzzle.paper}><Text style={puzzleText.body}>Loading your progress…</Text></Screen>;
  if (!player) return <Redirect href="/login" />;

  const completed = levels.filter((level) => progress[level.id]?.status === "COMPLETED");
  const next = levels.find((level) => isLevelUnlocked(level, progress) && progress[level.id]?.status !== "COMPLETED");
  const ongoing = round && !round.result ? getLevel(round.levelId) : undefined;
  const points = total?.playerId === player.id ? total.points : 0;
  const featured = ongoing ?? next;

  function continuePlaying() {
    if (!round || !ongoing) return;
    const crosswordReady = ongoing.huntWords.every((word) => round.found[word]);
    router.push(crosswordReady ? `/crossword/${ongoing.id}` : `/word-hunt/${ongoing.id}`);
  }

  return (
    <Screen background={puzzle.paper}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.brand}>Sali Puzzle</Text>
          <Text accessibilityRole="header" style={puzzleText.title}>Hi, {player.nickname}!</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarLetter}>{[...player.nickname][0]?.toUpperCase()}</Text></View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroHeading}>
          <Text style={styles.level}>{featured ? `Level ${featured.number}` : "Learning trail"}</Text>
          <View accessible accessibilityLabel="Available offline" style={styles.offline}>
            <Ionicons name="cloud-offline-outline" size={15} color={puzzle.ink} />
            <Text style={puzzleText.label}>Offline</Text>
          </View>
        </View>
        <Text style={styles.lesson}>{featured?.title ?? "All levels complete!"}</Text>
        <Text style={puzzleText.body}>{ongoing ? "Pick up where you left off." : "Read the lesson, hunt its words, and solve the clues."}</Text>
        <PuzzleButton onPress={ongoing ? continuePlaying : () => next ? router.push(`/lesson/${next.id}`) : router.push("/levels")}>
          {ongoing ? "Continue playing" : next ? "Play now" : "Replay a level"}
        </PuzzleButton>
        {ongoing && next && next.id !== ongoing.id && <PuzzleButton quiet onPress={() => router.push(`/lesson/${next.id}`)}>Play next level</PuzzleButton>}
      </View>

      <View style={styles.trail}>
        <View style={styles.heroHeading}>
          <Text style={puzzleText.label}>{completed.length} of {levels.length} levels complete</Text>
          <Text style={puzzleText.label}>{points} points earned</Text>
        </View>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Completed levels" accessibilityValue={{ min: 0, max: levels.length, now: completed.length }}>
          {levels.map((level) => <View key={level.id} style={[styles.segment, progress[level.id]?.status === "COMPLETED" && styles.filled]} />)}
        </View>
      </View>
      <View style={styles.routes}>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.route, pressed && styles.pressed]} onPress={() => router.push("/levels")}>
          <Ionicons name="map-outline" size={18} color={puzzle.grape} />
          <Text style={styles.routeText}>Explore levels</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.route, pressed && styles.pressed]} onPress={() => router.push("/levels?browse=lessons")}>
          <Ionicons name="book-outline" size={18} color={puzzle.grape} />
          <Text style={styles.routeText}>Lessons</Text>
        </Pressable>
      </View>
      {[shortcuts.slice(0, 2), shortcuts.slice(2)].map((row) => (
        <View key={row[0].label} style={styles.shortcuts}>
          {row.map((item) => (
            <Pressable key={item.label} accessibilityRole="button" onPress={() => router.push(item.route)} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}>
              <View style={[styles.icon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={21} color={puzzle.ink} /></View>
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  greeting: { flex: 1 },
  brand: { color: puzzle.grape, fontFamily: fonts.button, fontSize: 17, marginBottom: 4 },
  avatar: { borderRadius: 17, backgroundColor: puzzle.lilac, width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: puzzle.grape, fontSize: 22, fontWeight: "900" },
  hero: { borderRadius: 25, backgroundColor: puzzle.sunshine, padding: 17, gap: 10, borderBottomWidth: 5, borderBottomColor: "#DF961E" },
  heroHeading: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 6, alignItems: "center" },
  level: { color: puzzle.ink, fontWeight: "900" },
  offline: { flexDirection: "row", gap: 5, alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: puzzle.paper },
  lesson: { color: puzzle.ink, fontFamily: fonts.heading, fontSize: 27, letterSpacing: -0.6 },
  trail: { gap: 9, paddingHorizontal: 2 },
  track: { flexDirection: "row", gap: 3 },
  segment: { flex: 1, height: 7, borderRadius: 4, backgroundColor: puzzle.lilac },
  filled: { backgroundColor: puzzle.grape },
  routes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  route: { flexGrow: 1, flexBasis: 112, minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 8, backgroundColor: puzzle.lilac, borderRadius: 12 },
  routeText: { color: puzzle.grape, fontFamily: fonts.button, flexShrink: 1 },
  shortcuts: { flexDirection: "row", gap: 9 },
  shortcut: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7, minHeight: 61, padding: 8, borderRadius: 13, backgroundColor: puzzle.white, borderWidth: 1, borderColor: puzzle.lilac },
  icon: { width: 33, height: 33, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  shortcutLabel: { color: puzzle.ink, fontFamily: fonts.button, flexShrink: 1, fontSize: 14 },
  pressed: { opacity: 0.7 },
});
