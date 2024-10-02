// src/utils/theme.js

// Function to get the current theme from localStorage or system preference
export const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  };
  
  // Function to apply the theme to the document body and store it in localStorage
  export const applyTheme = (theme) => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  };
  
  // Function to toggle between light and dark themes
  export const toggleTheme = (currentTheme) => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    return newTheme;
  };