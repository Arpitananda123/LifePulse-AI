import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // If we're in the browser, check local storage
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme;
      if (storedTheme) {
        return storedTheme;
      }

      // If no theme in localStorage, use system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    
    // Default to light mode
    return 'light';
  });

  // Update class on document element when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // If theme is system, apply based on system preference
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      // Save actual theme to local storage
      localStorage.setItem('theme', systemTheme);
    } else {
      // Apply theme directly
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Set up listener for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
}