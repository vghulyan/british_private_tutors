// v1 ------------------
// import type { Config } from "tailwindcss";

// export default {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;

// v2 ------------------
import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";

const themes = {
  light: {
    background: "#ffffff",
    foreground: "#000000",
  },
  dark: {
    background: "#000000",
    foreground: "#ffffff",
  },
};

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      transitionProperty: {
        width: "width",
      },
      // screens: {
      //   tablet: "775px", // Custom breakpoint at 775px
      // },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [createThemes(themes)],
};

export default config;

// v3 -----------------
// import type { Config } from "tailwindcss";
// import { createThemes } from "tw-colors";
// import colors from "tailwindcss/colors";

// const baseColors = [
//   "gray",
//   "red",
//   "yellow",
//   "green",
//   "blue",
//   "indigo",
//   "purple",
//   "pink",
// ];

// const shadeMapping = {
//   "50": "900",
//   "100": "800",
//   "200": "700",
//   "300": "600",
//   "400": "500",
//   "500": "400",
//   "600": "300",
//   "700": "200",
//   "800": "100",
//   "900": "50",
// };

// // Safely filter and map colors
// const filteredColors = Object.fromEntries(
//   Object.entries(colors).filter(([key]) => baseColors.includes(key))
// );

// // Generate themes with defaults for missing shades
// const generateThemeObject = (
//   colors: Record<string, Record<string, string>>,
//   mapping: Record<string, string>,
//   invert = false
// ): Record<string, Record<string, string>> => {
//   return baseColors.reduce((theme, color) => {
//     theme[color] = Object.entries(mapping).reduce((shades, [light, dark]) => {
//       const shadeKey = invert ? dark : light;
//       shades[light] = colors[color]?.[shadeKey] || colors.gray["500"]; // Fallback to gray "500"
//       return shades;
//     }, {} as Record<string, string>);
//     return theme;
//   }, {} as Record<string, Record<string, string>>);
// };

// const lightTheme = generateThemeObject(filteredColors, shadeMapping);
// const darkTheme = generateThemeObject(filteredColors, shadeMapping, true);

// const themes = {
//   light: {
//     ...lightTheme,
//     white: "#ffffff",
//     black: "#000000",
//   },
//   dark: {
//     ...darkTheme,
//     white: "#1a1a1a", // Fallback dark white
//     black: "#f5f5f5", // Fallback dark black
//   },
// };

// const config: Config = {
//   darkMode: "class",
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//       transitionProperty: {
//         width: "width",
//       },
//     },
//   },
//   plugins: [createThemes(themes)],
// };

// export default config;
