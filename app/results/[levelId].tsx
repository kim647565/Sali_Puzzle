import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen, Tile } from "../../src/components/Screen";
import { getLevel } from "../../src/data/levels";
import { useAppStore } from "../../src/store";
import { colors, text } from "../../src/theme";

export default function Results() {
  const { levelId, score } = useLocalSearchParams<{ levelId: string; score?: string }>();
  const level = getLevel(levelId);
  const completeLevel = useAppStore((state) => state.completeLevel);
  if (!level) return <Screen><Text>Results not found.</Text></Screen>;
  const total = Number(score ?? 0);
  completeLevel(level.id, total, 3);
  return <Screen><Text style={[text.title, { textAlign: "center" }]}>Level complete!</Text><Text style={{ textAlign: "center", color: colors.muted }}>You connected the lesson to the puzzles.</Text><Tile color={colors.amber}><Text style={{ textAlign: "center", fontSize: 52 }}>★★★</Text><Text style={[text.heading, { textAlign: "center" }]}>{total} points</Text><Text style={{ textAlign: "center", marginTop: 6 }}>Accuracy: 100%</Text></Tile><Button onPress={() => router.replace("/levels")}>Find the next level</Button><Button variant="quiet" onPress={() => router.replace("/home")}>Back home</Button></Screen>;
}
