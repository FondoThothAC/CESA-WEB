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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        "accent-glow": "var(--accent-glow)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        border: "var(--border)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        // Owl Identity - Navy & Gold
        navy: {
          DEFAULT: '#003366', // Azul institucional UNISON
          light: '#0055a5',   // Azul para hover
          dark: '#0F172A',    // Fondo profundo para modo oscuro
        },
        gold: {
          DEFAULT: '#c4161c', // Rojo Institucional UNISON usado como acento principal
          light: '#e53935',
          dark: '#b71c1c',
        },
        cesa: {
          bg: '#F8FAFC',      // Fondo modo claro
          card: '#FFFFFF',    // Tarjetas modo claro
          border: '#E2E8F0',  // Bordes sutiles
        }
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
