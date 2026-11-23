import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { Button } from "../../src/components/Button";
import { Screen } from "../../src/components/Screen";
import { PuzzleButton, PuzzleScreen, puzzle, puzzleText } from "../../src/components/PuzzleScreen";
import { getLevel, levels } from "../../src/data/levels";
import { formatDuration } from "../../src/engines/round";
import { useAppStore } from "../../src/store";

const starReveal = FadeInDown.duration(300).reduceMotion(ReduceMotion.System);

export default function Results() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  const round = useAppStore((state) => state.round);
  if (!level || round?.levelId !== level.id || !round.result) {
    return <Screen><Text>Finish both puzzles to see your results.</Text><Button onPress={() => router.replace("/levels")}>Go to levels</Button></Screen>;
  }

  const { score, accuracy, stars, completedAt } = round.result;
  const next = levels.find((item) => item.number === level.number + 1);
  const stats = [
    ["Accuracy", `${Math.round(accuracy)}%`],
    ["Correct answers", String(round.solved.length + Object.keys(round.found).length)],
    ["Wrong attempts", String(round.wrong)],
    ["Hints used", String(round.hints)],
    ["Playtime", formatDuration(Math.floor(round.elapsedMs / 1000))],
    ["Completed on", new Date(completedAt).toLocaleDateString()],
  ];

  return (
    <PuzzleScreen level={level} stage="Results">
      <View>
        <Text accessibilityRole="header" style={puzzleText.title}>Level complete!</Text>
        <Text style={puzzleText.body}>{level.title}</Text>
      </View>
      <View style={styles.scoreCard}>
        <Animated.View entering={starReveal} accessible accessibilityLabel={`${stars} of 3 stars`} style={styles.stars}>
          {[1, 2, 3].map((index) => <Ionicons key={index} name={index <= stars ? "star" : "star-outline"} size={index === 2 ? 48 : 37} color={puzzle.grape} />)}
        </Animated.View>
        <Text style={styles.score}>{score} points</Text>
        <Text style={puzzleText.body}>{next ? `Level ${next.number} unlocked` : "You finished the learning trail!"}</Text>
      </View>
      <View style={styles.stats}>
        {stats.map(([label, value]) => (
          <View key={label} style={styles.stat}>
            <Text style={puzzleText.heading}>{value}</Text>
            <Text style={puzzleText.body}>{label}</Text>
          </View>
        ))}
      </View>
      <PuzzleButton onPress={() => router.replace(next ? `/lesson/${next.id}` : "/levels")}>{next ? "Play next level" : "View levels"}</PuzzleButton>
      <PuzzleButton quiet onPress={() => router.replace(`/lesson/${level.id}`)}>Replay level</PuzzleButton>
      <PuzzleButton quiet onPress={() => router.push("/records")}>View records</PuzzleButton>
      <PuzzleButton quiet onPress={() => router.dismissTo("/home")}>Back home</PuzzleButton>
    </PuzzleScreen>
  );
}

const styles = StyleSheet.create({
  scoreCard: { padding: 24, backgroundColor: puzzle.sunshine, borderRadius: 24, alignItems: "center", gap: 7, borderBottomWidth: 5, borderBottomColor: "#DF961E" },
  stars: { flexDirection: "row", alignItems: "center", gap: 9 },
  score: { fontSize: 40, fontWeight: "900", letterSpacing: -1, color: puzzle.ink, textAlign: "center" },
  stats: { flexDirection: "row", flexWrap: "wrap", rowGap: 14, padding: 16, borderRadius: 17, backgroundColor: puzzle.white, borderWidth: 1, borderColor: puzzle.lilac },
  stat: { width: "50%", paddingEnd: 5, gap: 3 },
});
