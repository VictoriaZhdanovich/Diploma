import type {Config} from "tailwindcss"

const config:Config={
    darkMode: "class",
    content:[
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme:{
        extend:{
            colors:{
                white:"#ffffff",
                gray:{
                    100:"#f3f4f6",
                    200:"#e5e7ed",
                    300:"#d1d5db",
                    500:"#6b7280",
                    700:"#374151",
                    800:"#1f2937",
                },
                orange:{
                    200:"#FDDF93",
                    400:"#FAB260",
                    500:"#F6AE3B",
                    700:"#392F27",
                },
                "dark-bg":"#101214",
                "dark-secondary":"#1d1f21",
                "dark-tertiary":"#3b3d40",
                "orange-primary":"#FF7C02",
                "stroke-dark":"#2d3135",
                "search-dark": "#392F27",
            },
            backgroundImage:{
                "gradient-radial":"radial-gradient(var(--tw-gradient-stops))",
                "gradient-conoc":
                    "conic-gardient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins:[],
};
export default config;