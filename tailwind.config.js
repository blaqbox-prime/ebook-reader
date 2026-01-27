/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}","./src/screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
  "app-taupe-grey": {
    "50": "#f4f2f1",
    "100": "#e8e5e3",
    "200": "#d2cac6",
    "300": "#bbb0aa",
    "400": "#a4968e",
    "500": "#8e7b71",
    "600": "#71635b",
    "700": "#554a44",
    "800": "#39312d",
    "900": "#1c1917",
    "950": "#141110"
  },
  "app-deep-mocha": {
    "50": "#f4f2f0",
    "100": "#e9e4e2",
    "200": "#d4c9c4",
    "300": "#beaea7",
    "400": "#a8938a",
    "500": "#93786c",
    "600": "#756057",
    "700": "#584841",
    "800": "#3b302b",
    "900": "#1d1816",
    "950": "#15110f"
  },
  "app-ash-brown": {
    "50": "#f4f2f0",
    "100": "#e9e4e2",
    "200": "#d4cac4",
    "300": "#beafa7",
    "400": "#a8958a",
    "500": "#937a6c",
    "600": "#756257",
    "700": "#584941",
    "800": "#3b312b",
    "900": "#1d1816",
    "950": "#15110f"
  },
  "app-khaki-beige": {
    "50": "#f4f2f0",
    "100": "#eae5e1",
    "200": "#d4cbc4",
    "300": "#bfb1a6",
    "400": "#a99789",
    "500": "#947d6b",
    "600": "#766456",
    "700": "#594b40",
    "800": "#3b322b",
    "900": "#1e1915",
    "950": "#15110f"
  },
  "app-golden-apricot": {
    "50": "#fcf3e9",
    "100": "#f8e6d3",
    "200": "#f2cda6",
    "300": "#ebb47a",
    "400": "#e49c4e",
    "500": "#de8321",
    "600": "#b1691b",
    "700": "#854e14",
    "800": "#59340d",
    "900": "#2c1a07",
    "950": "#1f1205"
  }
},
    fontFamily: {
      'lato-black': ['Lato-Black'],
          'lato-bold': ['Lato-Bold'],
          'lato-light': ['Lato-Light'],
          'lato-regular': ['Lato-Regular'],
          'lato-thin': ['Lato-Thin'],

          // Secondary - Lora
          "lora": ['Lora'],

          // Optional: Set default font families
          'primary': ['Lato-Regular'],
          'secondary': ['Lora'],

    }
    },
  },
  plugins: [],
}