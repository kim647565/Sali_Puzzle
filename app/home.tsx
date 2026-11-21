import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen, Tile } from "../src/components/Screen";
import { colors, spacing, text } from "../src/theme";
import { useAppStore } from "../src/store";
import { levels } from "../src/data/levels";

export default function Home() {
  const player = useAppStore((state) => state.player);
  const progress = useAppStore((state) => state.progress);
  const completed = levels.filter((level) => progress[level.id]?.status === "COMPLETED").length;
  return <Screen><View style={styles.header}><View><Text style={styles.eyebrow}>Ready offline</Text><Text style={text.title}>Hi, {player?.nickname ?? "solver"}.</Text></View><Text style={styles.avatar}>{player?.nickname?.[0]?.toUpperCase() ?? "S"}</Text></View><Tile color={colors.indigo}><Text style={styles.cardKicker}>Your next discovery</Text><Text style={styles.heroTitle}>{levels[completed]?.title ?? "All levels complete"}</Text><Text style={styles.heroText}>{completed < levels.length ? "Read a lesson, hunt the words, and unlock your next challenge." : "You found every lesson. Replay one to beat your best score."}</Text><Button variant="secondary" onPress={() => router.push(`/lesson/${levels[Math.min(completed, levels.length - 1)].id}`)}>Start learning</Button></Tile><View style={styles.stats}><Tile color={colors.mint}><Text style={styles.statNumber}>{completed}</Text><Text style={styles.statLabel}>levels found</Text></Tile><Tile color={colors.amber}><Text style={styles.statNumber}>{levels.length}</Text><Text style={styles.statLabel}>in the trail</Text></Tile></View><Button onPress={() => router.push("/levels")}>Explore levels</Button><Button variant="quiet" onPress={() => router.push("/how-to-play")}>How to play</Button><Button variant="quiet" onPress={() => router.push("/records")}>View records</Button><Button variant="quiet" onPress={() => router.push("/settings")}>Settings</Button><Button variant="quiet" onPress={() => router.replace("/login")}>Switch player</Button></Screen>;
}
const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, eyebrow: { color: colors.mint, fontWeight: "800", marginBottom: 4 }, avatar: { width: 48, height: 48, borderRadius: 18, backgroundColor: colors.amber, textAlign: "center", textAlignVertical: "center", fontSize: 22, fontWeight: "900", color: colors.ink }, cardKicker: { color: colors.paper, fontWeight: "800", marginBottom: 8 }, heroTitle: { color: colors.white, fontSize: 28, fontWeight: "900", marginBottom: 8 }, heroText: { color: colors.paper, fontSize: 16, lineHeight: 23, marginBottom: spacing.lg }, stats: { flexDirection: "row", gap: spacing.md }, statNumber: { fontSize: 34, fontWeight: "900", color: colors.ink }, statLabel: { color: colors.ink, fontWeight: "700" } });
