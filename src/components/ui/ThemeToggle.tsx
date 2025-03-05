
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  React.useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <AnimatedButton
      onClick={toggleTheme}
      size="sm"
      variant="outline"
      className="rounded-full"
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
      <span className="sr-only">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
    </AnimatedButton>
  );
};

export default ThemeToggle;
