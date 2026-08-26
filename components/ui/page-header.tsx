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
        'flex w-full items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3.5 sm:px-6',
        className,
      )}
    >
      <div
        className={cn(
          badgeVariants({ tone, variant: 'subtle' }),
          'flex min-w-0 flex-1 items-center justify-start gap-2.5 whitespace-normal border-none bg-transparent p-0',
        )}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-(--tone-color)"
          aria-hidden
        />

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
            {highlightText && (
              <span className="ml-1 text-(--tone-color)">
                {highlightText}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">{children}</div>
    </header>
  );
}
