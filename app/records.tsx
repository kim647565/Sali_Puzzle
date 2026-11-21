import { router } from "expo-router";
import { Text } from "react-native";
import { Button } from "../src/components/Button";
import { Screen, Tile } from "../src/components/Screen";
import { levels } from "../src/data/levels";
import { useAppStore } from "../src/store";
import { colors, text } from "../src/theme";

export default function Records() {
  const progress = useAppStore((state) => state.progress);
  const completed = levels.filter((level) => progress[level.id]?.status === "COMPLETED");
  return <Screen><Text style={text.title}>Your records</Text><Text style={{ color: colors.muted }}>Every solved level is saved on this device.</Text><Tile color={colors.indigo}><Text style={{ color: colors.paper }}>Completed levels</Text><Text style={{ color: colors.white, fontSize: 42, fontWeight: "900" }}>{completed.length}</Text></Tile>{completed.length ? completed.map((level) => <Tile key={level.id}><Text style={text.subheading}>{level.title}</Text><Text>{progress[level.id].bestScore} points · {progress[level.id].stars} stars</Text></Tile>) : <Tile><Text style={text.body}>No records yet. Solve your first level to start your trail.</Text></Tile>}<Button variant="quiet" onPress={() => router.back()}>Back</Button></Screen>;
}
