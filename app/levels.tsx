import { router } from "expo-router";
import { Text } from "react-native";
import { Screen, Tile } from "../src/components/Screen";
import { colors, text } from "../src/theme";
import { levels } from "../src/data/levels";
import { useAppStore } from "../src/store";
import { Button } from "../src/components/Button";

export default function Levels() {
  const progress = useAppStore((state) => state.progress);
  return <Screen><Text style={text.title}>The learning trail</Text><Text style={[text.body, { color: colors.muted }]}>Each solved level opens the next clue.</Text>{levels.map((level, index) => { const unlocked = index === 0 || progress[levels[index - 1].id]?.status === "COMPLETED"; const done = progress[level.id]?.status === "COMPLETED"; return <Tile key={level.id} color={done ? colors.mint : colors.white}><Text style={text.subheading}>{level.number}. {level.title}</Text><Text style={{ color: colors.muted, marginVertical: 5 }}>{level.topic} · {level.difficulty}</Text><Button disabled={!unlocked} variant={done ? "secondary" : "primary"} onPress={() => router.push(`/lesson/${level.id}`)}>{done ? "Replay level" : unlocked ? "Open lesson" : "Locked"}</Button></Tile>; })}</Screen>;
}
