import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { type BadgeTone, badgeVariants } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  highlightText?: string;
  className?: string;
  children?: ReactNode;
  tone?: BadgeTone;
}

export function PageHeader({
  title,
  subtitle,
  highlightText,
  className,
  children,
  tone = 'primary',
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        badgeVariants({ tone, variant: 'subtle' }),
        'w-full flex flex-col border-b border-border/60 relative overflow-hidden px-3 sm:px-6 pb-2.5 sm:pb-3 justify-end pt-5 sm:pt-6 min-h-16 sm:min-h-20',
        'rounded-none border-x-0 border-t-0 font-sans shadow-none transition-colors duration-300',

        className,
      )}
    >
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, var(--tone-color) 0%, transparent 60%), 
                      linear-gradient(to right, var(--tone-color) 0%, transparent 40%)`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-full h-0.5 opacity-20 dark:opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, var(--tone-color), transparent)`,
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end w-full gap-2 sm:gap-0">
        <div className="order-2 sm:order-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter italic leading-none uppercase flex items-center gap-2">
            <span className="text-foreground/90">{title}</span>
            {highlightText && (
              <span
                className="drop-shadow-[0_0_10px_var(--tone-color)]"
                style={{ color: 'var(--tone-color)' }}
              >
                {highlightText}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/80 dark:text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium mt-0.5 sm:mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="order-1 sm:order-2 flex gap-2 items-center justify-between sm:justify-end w-full sm:w-auto">
          {children}
        </div>
      </div>
    </header>
  );
}
