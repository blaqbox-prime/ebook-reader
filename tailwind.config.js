/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#937051",
        secondary: "#C1A98C",
        dark: "#2E2D2B",
        light: "#F2EFE7"
      },
      fontFamily: {
        'sans': ['Lato-Regular'],
        // Primary - Lato
        'lato-black': ['Lato-Black'],
        'lato-bold': ['Lato-Bold'],
        'lato-light': ['Lato-Light'],
        'lato-regular': ['Lato-Regular'],
        'lato-thin': ['Lato-Thin'],
        
        // Secondary - Lora
        "serif": ['Lora'],
                
        // Optional: Set default font families
        'primary': ['Lato-Regular'],
        'secondary': ['Lora'],
      },
    },
  },
  plugins: [],
}