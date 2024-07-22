import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    theme: {
      extend: {
        colors: {
          primary: '#4CAF50',  // Green color for primary buttons
          secondary: '#FF5722', // Orange color for secondary buttons
          background: '#282c34', // Dark background color
          card: '#ffffff', // White background for cards
        },
        spacing: {
          '128': '32rem',
        },
        borderRadius: {
          'lg': '1rem',
        },
      },
    },
  },
  plugins: [],
};
export default config;
