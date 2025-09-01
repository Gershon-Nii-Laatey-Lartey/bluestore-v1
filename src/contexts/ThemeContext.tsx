import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Function to update theme color meta tag and manifest
  const updateThemeColor = (newTheme: Theme) => {
    const themeColorMeta = document.getElementById('theme-color-meta') as HTMLMetaElement;
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', newTheme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
    
    // Update manifest background color for PWA
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // Create a new manifest with updated background color
      const manifest = {
        name: "BlueStore Ghana",
        short_name: "BlueStore",
        description: "Ghana's premier online marketplace for buying and selling electronics, fashion, automotive parts, and more.",
        start_url: "/",
        display: "standalone",
        background_color: newTheme === 'dark' ? '#0a0a0a' : '#ffffff',
        theme_color: "#2563eb",
        orientation: "portrait-primary",
        scope: "/",
        lang: "en",
        categories: ["shopping", "marketplace", "business"],
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png"
          }
        ]
      };
      
      // Create a blob URL for the updated manifest
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      manifestLink.href = url;
    }
  };

  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setThemeState(systemTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update theme color meta tag and manifest
    updateThemeColor(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
