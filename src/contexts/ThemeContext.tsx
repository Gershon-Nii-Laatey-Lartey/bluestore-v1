import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (checked?: boolean) => void;
  setTheme: (theme: Theme) => void;
  resetToSystemTheme: () => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

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
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    const hasUserSetTheme = localStorage.getItem('user-theme-set') === 'true';
    
    console.log('Theme initialization:', { savedTheme, hasUserSetTheme }); // Debug log
    
    if (savedTheme && hasUserSetTheme) {
      // User has manually set a theme, use it
      console.log('Using user-set theme:', savedTheme);
      setThemeState(savedTheme);
    } else if (savedTheme) {
      // Theme exists but user hasn't explicitly set it, use saved theme
      console.log('Using saved theme (not user-set):', savedTheme);
      setThemeState(savedTheme);
    } else {
      // No theme saved, check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      console.log('Using system theme:', systemTheme);
      setThemeState(systemTheme);
    }

    // Listen for system theme changes (only if user hasn't manually set a theme)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const hasUserSetTheme = localStorage.getItem('user-theme-set') === 'true';
      if (!hasUserSetTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        console.log('System theme changed to:', systemTheme);
        setThemeState(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update theme color meta tag and manifest
    updateThemeColor(theme);
    
    // Only save to localStorage if this is after initialization
    // This prevents overwriting the saved theme during initial load
    if (isInitialized) {
      localStorage.setItem('theme', theme);
      console.log('Theme saved to localStorage:', theme);
    }
  }, [theme, isInitialized]);

  const toggleTheme = (checked?: boolean) => {
    let newTheme: Theme;
    
    if (checked !== undefined) {
      // Called from Switch component with explicit boolean value
      newTheme = checked ? 'dark' : 'light';
      console.log('Theme toggled via Switch:', { checked, newTheme });
    } else {
      // Called without parameter, toggle current theme
      newTheme = theme === 'light' ? 'dark' : 'light';
      console.log('Theme toggled manually:', { currentTheme: theme, newTheme });
    }
    
    // Mark that user has manually set a theme
    localStorage.setItem('user-theme-set', 'true');
    localStorage.setItem('theme', newTheme);
    console.log('User theme preference saved:', newTheme);
    
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    // Mark that user has manually set a theme
    localStorage.setItem('user-theme-set', 'true');
    localStorage.setItem('theme', newTheme);
    console.log('Theme set manually:', newTheme);
    
    setThemeState(newTheme);
  };

  const resetToSystemTheme = () => {
    // Remove user theme preference and use system theme
    localStorage.removeItem('user-theme-set');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    localStorage.setItem('theme', systemTheme);
    console.log('Reset to system theme:', systemTheme);
    
    setThemeState(systemTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, resetToSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
