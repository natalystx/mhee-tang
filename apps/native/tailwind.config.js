import { hairlineWidth } from "nativewind/theme";

/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = [
  "./app/**/*.{js,ts,tsx}",
  "./components/**/*.{js,ts,tsx}",
];
export const presets = [require("nativewind/preset")];
export const theme = {
  extend: {},
};
export const plugins = [];
