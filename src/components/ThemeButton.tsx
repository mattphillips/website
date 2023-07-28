'use client';

import { useTheme } from 'next-themes';

import { Button } from './Button';
import { Moon, Sun } from './icons';

export const ThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      tag="Button"
      variant="secondary"
      size="grow"
      aria-label="Toggle dark mode"
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="overflow-hidden"
    >
      <div className="relative h-6 w-6">
        <Sun className="absolute inset-0 rotate-90 transform transition-transform duration-700 dark:rotate-0 origin-[50%_40px]" />
        <Moon className="absolute inset-0 rotate-0 transform transition-transform duration-700 dark:-rotate-90 origin-[50%_40px]" />
      </div>
    </Button>
  );
};
