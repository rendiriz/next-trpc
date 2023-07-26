import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import cn from 'classnames';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <button
      aria-label="Toggle Theme Switcher"
      type="button"
      className={cn(
        'text-gray-800 dark:text-gray-50',
        'inline-flex items-center justify-center rounded-md p-2',
      )}
      onClick={handleClick}
    >
      {isMounted && theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ThemeSwitcher;
