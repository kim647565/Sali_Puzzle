import { router } from "expo-router";
import { Text } from "react-native";
import { Button } from "../src/components/Button";
import { Screen, Tile } from "../src/components/Screen";
import { colors, text } from "../src/theme";

const steps = [
  ["Read the lesson", "Learn the new topic and study the key words."],
  ["Start word hunt", "Tap the first and last letter of a hidden lesson word."],
  ["Use a straight line", "Choose words across, down, or diagonally."],
  ["Solve the crossword", "Use the discovered words to answer every clue."],
  ["Unlock the next level", "Complete both puzzles to earn points and stars."]
];

export default function HowToPlay() {
  return <Screen><Text style={text.title}>How to play</Text>{steps.map(([title, body], index) => <Tile key={title} color={index === 0 ? colors.amber : colors.white}><Text style={text.subheading}>{index + 1}. {title}</Text><Text style={{ ...text.body, color: colors.muted, marginTop: 6 }}>{body}</Text></Tile>)}<Button onPress={() => router.back()}>Back</Button></Screen>;
}
