import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme/theme-provider";

// Add a script to apply the theme before React hydrates to prevent flashing
const themeScript = `
  (function() {
    const storageKey = 'theme';
    const theme = localStorage.getItem(storageKey) || 'system';
    
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    
    document.documentElement.classList.add(resolvedTheme);
  })();
`;

// Create and insert the script element
if (typeof window !== 'undefined') {
  const scriptEl = document.createElement('script');
  scriptEl.innerHTML = themeScript;
  document.head.appendChild(scriptEl);
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="theme">
    <App />
  </ThemeProvider>
);
