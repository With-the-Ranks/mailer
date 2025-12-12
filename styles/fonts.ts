import { League_Spartan } from "next/font/google";

export const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
});

export const fontMapper = {
  "font-league-spartan": leagueSpartan.variable,
} as Record<string, string>;
