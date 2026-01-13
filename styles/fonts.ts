import { Inter, League_Spartan } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
});

export const fontMapper = {
  "font-inter": inter.variable,
  "font-league-spartan": leagueSpartan.variable,
} as Record<string, string>;
