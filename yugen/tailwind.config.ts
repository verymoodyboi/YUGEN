import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
    darkMode: "class",
 theme: {
    extend: {
      colors: {
        primary: {
          light: '#10b981', // emerald-500
          dark: '#6366f1',  // indigo-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
