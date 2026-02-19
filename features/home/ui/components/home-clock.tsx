'use client';

import React, { useState, useEffect } from 'react';
import { BadgeTone, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HomeClockProps {
  tone?: BadgeTone;
}

export function HomeClock({ tone = 'primary' }: HomeClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div
      className={cn(
        badgeVariants({ tone, variant: 'subtle' }),
        'flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 w-full',
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <span
        className="text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm"
        style={{ color: 'var(--tone-color)' }}
      >
        {formatTime(time)}
      </span>
      <span className="text-xs text-gray-400 mt-1 capitalize">
        {formatDate(time)}
      </span>
    </div>
  );
}
