import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../theme";

export function Button({ children, onPress, variant = "primary", disabled = false }: PropsWithChildren<{ onPress: () => void; variant?: "primary" | "secondary" | "quiet"; disabled?: boolean }>) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}><Text style={[styles.label, variant === "secondary" && styles.darkLabel]}>{children}</Text></Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.lg },
  primary: { backgroundColor: colors.indigo },
  secondary: { backgroundColor: colors.amber },
  quiet: { backgroundColor: "transparent" },
  label: { color: colors.white, fontSize: 16, fontWeight: "800" },
  darkLabel: { color: colors.ink },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 }
});
