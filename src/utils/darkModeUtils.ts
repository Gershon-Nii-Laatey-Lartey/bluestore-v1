// Common dark mode class mappings for consistent theming
export const darkModeClasses = {
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-400',
    light: 'text-gray-400 dark:text-gray-500',
  },
  
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    muted: 'bg-gray-100 dark:bg-gray-700',
    card: 'bg-white dark:bg-gray-800',
  },
  
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-100 dark:border-gray-600',
  },
  
  // Hover states
  hover: {
    bg: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    text: 'hover:text-gray-900 dark:hover:text-gray-100',
  }
};

// Helper function to apply dark mode classes
export const applyDarkMode = (baseClass: string, darkClass: string) => {
  return `${baseClass} ${darkClass}`;
};

// Common patterns for quick fixes
export const commonDarkModeFixes = {
  heading: 'text-gray-900 dark:text-gray-100',
  body: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-400',
  card: 'bg-white dark:bg-gray-800',
  border: 'border-gray-200 dark:border-gray-700',
};
