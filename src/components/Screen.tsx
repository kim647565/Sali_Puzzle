import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

export function Screen({ children, scroll = true, background = colors.paper }: PropsWithChildren<{ scroll?: boolean; background?: string }>) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>{scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}</SafeAreaView>;
}

export function Tile({ children, color = colors.white }: PropsWithChildren<{ color?: string }>) {
  return <View style={[styles.tile, { backgroundColor: color }]}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flexGrow: 1 },
  content: { flex: 1, width: "100%", maxWidth: 600, alignSelf: "center", padding: spacing.lg, gap: spacing.md },
  tile: { borderRadius: 24, padding: spacing.lg, ...({ shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 }) }
});
