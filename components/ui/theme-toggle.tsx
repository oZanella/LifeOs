'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="link"
      size="icon"
      onClick={toggleTheme}
      aria-label="Alterar tema"
      className={`relative transition-all duration-300 hover:scale-110 active:scale-90 sm:hidden ${className}`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alterar tema</span>
    </Button>
  );
}
