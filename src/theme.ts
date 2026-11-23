import { Platform } from "react-native";

export const colors = {
  ink: "#172033",
  paper: "#E8F1FF",
  indigo: "#5B5CE2",
  mint: "#42C7A5",
  amber: "#FFC857",
  coral: "#F4776B",
  white: "#FFFFFF",
  muted: "#6E7A91",
  line: "#D6E0F0",
  locked: "#AAB5C7"
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;

export const fonts = { heading: "PoppinsBold", button: "PoppinsSemiBold", body: "NunitoRegular" } as const;

export const fontAssets = {
  [fonts.heading]: require("../assets/fonts/Poppins-Bold.ttf"),
  [fonts.button]: require("../assets/fonts/Poppins-SemiBold.ttf"),
  [fonts.body]: require("../assets/fonts/Nunito.ttf"),
};

export const text = {
  title: { fontSize: 34, fontFamily: fonts.heading, letterSpacing: -1 },
  heading: { fontSize: 24, fontFamily: fonts.heading },
  subheading: { fontSize: 18, fontFamily: fonts.button },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.body },
  small: { fontSize: 13, lineHeight: 18, fontFamily: fonts.body }
};

export const shadow = Platform.select({
  ios: { shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 3 }
});
