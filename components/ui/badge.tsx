import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all overflow-hidden group/badge',
  {
    variants: {
      variant: {
        solid: 'border-transparent',
        outline: 'bg-transparent',
        subtle: 'border-transparent',
      },
      tone: {
        default:
          'bg-muted text-muted-foreground border-border [--tone-color:theme(colors.gray.500)]',
        primary:
          'bg-primary/10 text-primary border-primary/20 [--tone-color:theme(colors.primary.DEFAULT)]',
        secondary:
          'bg-secondary/10 text-secondary border-secondary/20 [--tone-color:theme(colors.secondary.DEFAULT)]',
        success:
          'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 [--tone-color:theme(colors.emerald.500)]',
        info: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 [--tone-color:theme(colors.blue.500)]',
        warning:
          'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 [--tone-color:theme(colors.amber.500)]',
        error:
          'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 [--tone-color:theme(colors.red.500)]',
        accent:
          'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 [--tone-color:theme(colors.purple.500)]',
        gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-transparent shadow-sm [--tone-color:theme(colors.yellow.500)]',
        online:
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 [--tone-color:theme(colors.emerald.400)]',
        neutral:
          'bg-gray-500/10 text-gray-500 border-gray-500/20 [--tone-color:theme(colors.gray.400)]',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        tone: 'primary',
        className: 'bg-primary text-primary-foreground',
      },
      {
        variant: 'solid',
        tone: 'success',
        className: 'bg-emerald-600 text-white',
      },
    ],
    defaultVariants: {
      variant: 'subtle',
      tone: 'default',
    },
  },
);

export type BadgeTone = VariantProps<typeof badgeVariants>['tone'];

interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant,
  tone,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-tone={tone}
      className={cn(badgeVariants({ variant, tone, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
