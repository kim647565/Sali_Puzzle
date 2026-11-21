import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen, Tile } from "../../src/components/Screen";
import { getLevel } from "../../src/data/levels";
import { colors, text } from "../../src/theme";

export default function Lesson() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(levelId);
  if (!level) return <Screen><Text>Lesson not found.</Text></Screen>;
  return <Screen><Text style={text.title}>{level.title}</Text><Text style={{ color: colors.mint, fontWeight: "800" }}>{level.topic} · {level.difficulty}</Text><Tile><Text style={text.subheading}>What you will learn</Text>{level.objectives.map((objective) => <Text key={objective} style={text.body}>• {objective}</Text>)}</Tile><Tile color={colors.white}><Text style={text.body}>{level.lesson}</Text></Tile><Text style={text.subheading}>Key words</Text>{level.vocabulary.map((item) => <Tile key={item.word} color={colors.paper}><Text style={text.subheading}>{item.word}</Text><Text style={{ color: colors.muted }}>{item.definition}</Text></Tile>)}<Button onPress={() => router.push(`/word-hunt/${level.id}`)}>Start word hunt</Button><Button variant="quiet" onPress={() => router.back()}>Back to levels</Button></Screen>;
}
