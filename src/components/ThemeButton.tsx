'use client';

import { useTheme } from 'next-themes';

import { Action } from './Action';
import { Moon, Sun } from './icons';

export const ThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Action
      tag="Button"
      aria-label="Toggle dark mode"
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="md:absolute md:top-1 md:right-1/2 bg-gray-100 dark:bg-gray-700 inline-flex items-center justify-center overflow-hidden rounded-lg p-2 md:transition-transform md:transform md:hover:scale-125"
    >
      <div className="relative h-6 w-6">
        <Sun className="absolute inset-0 rotate-90 transform transition-transform duration-700 dark:rotate-0 origin-[50%_40px]" />
        <Moon className="absolute inset-0 rotate-0 transform transition-transform duration-700 dark:-rotate-90 origin-[50%_40px]" />
      </div>
    </Action>
  );
};
