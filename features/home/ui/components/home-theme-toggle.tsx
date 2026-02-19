'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function HomeThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 w-full h-10 bg-[#1A1A1A] rounded-2xl border border-white/5 animate-pulse" />
    );
  }

  const themes = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Escuro' },
    { id: 'system', icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-black/20 dark:bg-[#1A1A1A] rounded-2xl border border-white/5 shadow-inner">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center py-1.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5',
            )}
            title={t.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
