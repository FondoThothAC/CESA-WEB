'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-border bg-bg-secondary text-text-main hover:bg-accent-glow transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <>
          <Sun size={18} className="text-accent" />
          <span className="text-xs font-bold uppercase hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <Moon size={18} className="text-primary" />
          <span className="text-xs font-bold uppercase hidden sm:inline">Oscuro</span>
        </>
      )}
    </button>
  );
}
