'use client';

import { BadgeTone, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface HomeProgressSummaryProps {
  tone?: BadgeTone;
}

export function HomeProgressSummary({
  tone = 'primary',
}: HomeProgressSummaryProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalTime = 2 * 60 * 1000;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  const isComplete = progress >= 100;
  const isNoComplete = progress === 0;

  return (
    <div
      className={cn(
        badgeVariants({
          tone: isComplete ? 'success' : tone,
          variant: 'subtle',
        }),
        'flex flex-col gap-4 p-4 rounded-2xl border border-border/10 transition-all duration-300 w-full',
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            badgeVariants({
              tone: isComplete ? 'success' : tone,
              variant: 'subtle',
            }),
            ' border-none bg-transparent',
          )}
        >
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Tempo de Sessão
          </h3>
          <span
            className="text-[10px] font-black"
            style={{ color: 'var(--tone-color)' }}
          >
            {isComplete
              ? 'LIMITE ATINGIDO'
              : isNoComplete
                ? 'INICIANDO'
                : 'EM CURSO'}
          </span>
        </div>
      </div>

      <div className="space-y-4 text-foreground">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1 text-[11px] font-medium">
            <span className="text-muted-foreground uppercase">
              Progresso diário
            </span>

            <div className="flex items-center gap-1">
              <span> - </span>
              <span style={{ color: 'var(--tone-color)' }}>{progress}%</span>
            </div>
          </div>

          <div className="h-1.5 w-full shrink-0 bg-muted rounded-full overflow-hidden border border-border/5">
            <div
              className="h-full transition-all duration-1000 ease-linear rounded-full"
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
