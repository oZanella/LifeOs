'use client';

import { BadgeTone, badgeVariants } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeProgressSummaryProps {
  tone?: BadgeTone;
}

export function HomeProgressSummary({
  tone = 'primary',
}: HomeProgressSummaryProps) {
  const progress = 28;

  return (
    <div
      className={cn(
        badgeVariants({ tone, variant: 'subtle' }),
        'flex flex-col gap-4 p-4 rounded-2xl border border-border/10 transition-all duration-300 w-full',
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Progresso Diário
        </h3>
        <Target
          size={14}
          className="opacity-50"
          style={{ color: 'var(--tone-color)' }}
        />
      </div>

      <div className="space-y-4 text-foreground">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-muted-foreground">TASKS COMPLETAS</span>
            <span style={{ color: 'var(--tone-color)' }}> - {progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/5">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--tone-color)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
