/** @type {import('tailwindcss').Config} */
import AnimatePlugin from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    darkMode: ["selector", '[data-mode="dark"]'],
    prefix: "",
    theme: {
        fontFamily: {
            'sans': ['Poppins', ...defaultTheme.fontFamily.sans],
        },
        container: {
            center: true,
            padding: "2rem",
        },
        extend: {
            screens: {
                "2xl": "1400px",
            },
            colors: {
                primary: {
                    100: "#F6E6EF", // OPACITY 20%
                    200: "#ECD4E1",
                    500: "#14ACCD",
                    600: "#14ACCD",
                },
                tertiary: {
                    100: "#F1F0FC",
                    200: "#E5E3F7",
                    400: "#8D86AD",
                    600: "#202D38",
                },
                grey: {
                    100: "#FEFEFE", // fondos de las tarjetas
                    200: "#F1F1F1", // fondos de las tarjetas
                    600: "#6C6C6C", // letras grises
                    700: "#454545", // LETRAS TITULOS
                    500: "#202D38",
                }
            },
            spacing: {
                'navbar-desktop': '64px',
                'navbar-mobile': '56px',
            },
            height: {
                'screen-navbar': 'calc(100vh - 64px)',
                'screen-navbar-mobile': 'calc(100vh - 56px)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                'shake' : {
                    '10%, 90%': {
                        transform: 'translate3d(-1px, 0, 0)'
                    },
                    '20%, 80%' : {
                        transform: 'translate3d(1px, 0, 0)'
                    },
                    '30%, 50%, 70%': {
                        transform: 'translate3d(-1px, 0, 0)'
                    },
                    '40%, 60%': {
                        transform: 'translate3d(1px, 0, 0)'
                    }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite',
            },
        },
    },
    plugins: [AnimatePlugin],
};