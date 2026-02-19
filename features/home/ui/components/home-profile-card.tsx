'use client';

import { User } from 'lucide-react';

import { BadgeTone, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HomeProfileCardProps {
  tone?: BadgeTone;
}

export function HomeProfileCard({ tone = 'primary' }: HomeProfileCardProps) {
  return (
    <div
      className={cn(
        badgeVariants({ tone, variant: 'subtle' }),
        'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group w-full',
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        className="relative p-1 rounded-full border-2 transition-transform duration-300 group-hover:scale-105"
        style={{ borderColor: 'var(--tone-color)' }}
      >
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg">
          <User size={24} />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-foreground font-semibold truncate text-sm">
          Henrique Zanella
        </span>
        <span className="text-xs text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Online
        </span>
      </div>
    </div>
  );
}
