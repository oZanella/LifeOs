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
        'w-full flex flex-col border-b border-white/5 relative overflow-hidden px-6 pb-6 justify-end pt-12 min-h-32',
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

      <div className="relative z-10 flex justify-between items-end w-full">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic leading-none uppercase flex items-center gap-2">
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
            <p className="text-[10px] text-muted-foreground/80 dark:text-gray-400 uppercase tracking-[0.3em] font-medium mt-3">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-1">{children}</div>
      </div>
    </header>
  );
}
