'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { lab_itens, type PageType } from '../tabs/home-config';

interface HomeNavigationProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

export function HomeNavigation({
  activePage,
  onPageChange,
}: HomeNavigationProps) {
  return (
    <nav className="flex gap-2 p-2 bg-muted/70 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-border/50 overflow-x-auto no-scrollbar">
      {lab_itens.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg relative group cursor-pointer',
              isActive
                ? 'bg-background text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:bg-background/80 dark:hover:bg-white/5',
              item.className,
            )}
            style={isActive ? { color: 'var(--tone-color)' } : {}}
          >
            <Icon
              size={18}
              className={cn(
                isActive
                  ? 'text-(--tone-color)'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>

            {isActive && (
              <span
                className="absolute -bottom-1 left-4 right-4 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--tone-color)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
