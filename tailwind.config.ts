import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        postal: {
          red: "#ee0000",
          darkRed: "#cc0000",
          lightRed: "#ffebeb",
        },
      },
    },
  },
  plugins: [],
};
export default config;
