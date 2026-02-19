'use client';

import { User } from 'lucide-react';

import { BadgeTone, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { user_config } from '../../home-user-config';

interface HomeProfileCardProps {
  tone?: BadgeTone;
}

export function HomeProfileCard({ tone = 'primary' }: HomeProfileCardProps) {
  return (
    <div
      className={cn(
        badgeVariants({ tone, variant: 'subtle' }),
        'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group w-full backgroundColor: bg-transparent',
      )}
    >
      <div className="relative p-1 rounded-full border-2 transition-transform duration-300 group-hover:scale-105">
        <div className=" backgroundColor: 'var(--tone-color)' w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
          <User size={24} />
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-foreground font-semibold truncate text-sm">
          {user_config.name}
        </span>
        <div
          className={cn(
            badgeVariants({ tone: 'online', variant: 'subtle' }),
            'px-1.5 py-0 border-none bg-transparent',
          )}
        >
          <span className="text-[10px] flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse backgroundColor: 'var(--tone-color)'" />
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
