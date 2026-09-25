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
          'bg-orange-500/10 text-orange-700 border-orange-500/25 dark:text-orange-300 [--tone-color:theme(colors.orange.500)]',
        error:
          'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 [--tone-color:theme(colors.red.500)]',
        accent:
          'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 [--tone-color:theme(colors.purple.500)]',
        indigo:
          'bg-indigo-500/10 text-indigo-700 border-indigo-500/25 dark:text-indigo-300 [--tone-color:theme(colors.indigo.500)]',
        teal: 'bg-teal-500/10 text-teal-700 border-teal-500/25 dark:text-teal-300 [--tone-color:theme(colors.teal.500)]',
        lime: 'bg-lime-500/10 text-lime-700 border-lime-500/25 dark:text-lime-300 [--tone-color:theme(colors.lime.500)]',
        amber:
          'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300 [--tone-color:theme(colors.amber.500)]',
        rose: 'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300 [--tone-color:theme(colors.rose.500)]',
        online:
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 [--tone-color:theme(colors.emerald.400)]',
        neutral:
          'bg-gray-500/10 text-gray-500 border-gray-500/20 [--tone-color:theme(colors.gray.400)]',
        azul: 'bg-sky-500/15 text-sky-700 border-sky-500 dark:text-sky-300 [--tone-color:theme(colors.sky.500)]',

        violeta:
          'bg-violet-500/15 text-violet-700 border-violet-500 dark:text-violet-300 [--tone-color:theme(colors.violet.500)]',

        esmeralda:
          'bg-emerald-500/15 text-emerald-700 border-emerald-500 dark:text-emerald-300 [--tone-color:theme(colors.emerald.500)]',

        'azul-claro':
          'bg-blue-500/15 text-blue-700 border-blue-500 dark:text-blue-300 [--tone-color:theme(colors.blue.500)]',

        laranja:
          'bg-orange-500/15 text-orange-700 border-orange-500 dark:text-orange-300 [--tone-color:theme(colors.orange.500)]',

        vermelho:
          'bg-red-500/15 text-red-700 border-red-500 dark:text-red-300 [--tone-color:theme(colors.red.500)]',

        rosa: 'bg-fuchsia-500/15 text-fuchsia-700 border-fuchsia-500 dark:text-fuchsia-300 [--tone-color:theme(colors.fuchsia.500)]',

        ardosia:
          'bg-slate-500/15 text-slate-700 border-slate-500 dark:text-slate-300 [--tone-color:theme(colors.slate.500)]',

        marrom:
          'bg-amber-800/20 text-amber-900 border-amber-800 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 [--tone-color:theme(colors.amber.800)]',

        amarelo:
          'bg-yellow-500/15 text-yellow-700 border-yellow-500 dark:text-yellow-300 [--tone-color:theme(colors.yellow.500)]',

        verde:
          'bg-green-500/15 text-green-700 border-green-500 dark:text-green-300 [--tone-color:theme(colors.green.500)]',

        ciano:
          'bg-cyan-500/15 text-cyan-700 border-cyan-500 dark:text-cyan-300 [--tone-color:theme(colors.cyan.500)]',

        roxo: 'bg-purple-500/15 text-purple-700 border-purple-500 dark:text-purple-300 [--tone-color:theme(colors.purple.500)]',

        pink: 'bg-pink-500/15 text-pink-700 border-pink-500 dark:text-pink-300 [--tone-color:theme(colors.pink.500)]',

        // Tons escuros
        grafite:
          'bg-stone-700/20 text-stone-700 border-stone-700 dark:bg-stone-700/40 dark:text-stone-300 dark:border-stone-600 [--tone-color:theme(colors.stone.700)]',
        vinho:
          'bg-red-800/20 text-red-800 border-red-800 dark:bg-red-800/40 dark:text-red-300 dark:border-red-600 [--tone-color:theme(colors.red.800)]',
        terracota:
          'bg-orange-700/20 text-orange-700 border-orange-700 dark:bg-orange-700/40 dark:text-orange-300 dark:border-orange-600 [--tone-color:theme(colors.orange.700)]',
        mostarda:
          'bg-yellow-700/20 text-yellow-700 border-yellow-700 dark:bg-yellow-700/40 dark:text-yellow-300 dark:border-yellow-600 [--tone-color:theme(colors.yellow.700)]',
        oliva:
          'bg-lime-800/20 text-lime-800 border-lime-800 dark:bg-lime-800/40 dark:text-lime-300 dark:border-lime-600 [--tone-color:theme(colors.lime.800)]',
        musgo:
          'bg-green-800/20 text-green-800 border-green-800 dark:bg-green-800/40 dark:text-green-300 dark:border-green-600 [--tone-color:theme(colors.green.800)]',
        petroleo:
          'bg-teal-800/20 text-teal-800 border-teal-800 dark:bg-teal-800/40 dark:text-teal-300 dark:border-teal-600 [--tone-color:theme(colors.teal.800)]',
        marinho:
          'bg-blue-900/20 text-blue-900 border-blue-900 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-600 [--tone-color:theme(colors.blue.900)]',
        berinjela:
          'bg-purple-900/20 text-purple-900 border-purple-900 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-600 [--tone-color:theme(colors.purple.900)]',
        ameixa:
          'bg-fuchsia-800/20 text-fuchsia-800 border-fuchsia-800 dark:bg-fuchsia-800/40 dark:text-fuchsia-300 dark:border-fuchsia-600 [--tone-color:theme(colors.fuchsia.800)]',

        // Tons pastel
        areia:
          'bg-stone-300/30 text-stone-800 border-stone-300 dark:bg-stone-300/15 dark:text-stone-200 dark:border-stone-300/70 [--tone-color:theme(colors.stone.300)]',
        salmao:
          'bg-red-300/30 text-red-800 border-red-300 dark:bg-red-300/15 dark:text-red-200 dark:border-red-300/70 [--tone-color:theme(colors.red.300)]',
        pessego:
          'bg-orange-200/30 text-orange-800 border-orange-200 dark:bg-orange-200/15 dark:text-orange-200 dark:border-orange-200/70 [--tone-color:theme(colors.orange.200)]',
        baunilha:
          'bg-yellow-200/30 text-yellow-800 border-yellow-200 dark:bg-yellow-200/15 dark:text-yellow-200 dark:border-yellow-200/70 [--tone-color:theme(colors.yellow.200)]',
        pistache:
          'bg-lime-300/30 text-lime-800 border-lime-300 dark:bg-lime-300/15 dark:text-lime-200 dark:border-lime-300/70 [--tone-color:theme(colors.lime.300)]',
        menta:
          'bg-emerald-300/30 text-emerald-800 border-emerald-300 dark:bg-emerald-300/15 dark:text-emerald-200 dark:border-emerald-300/70 [--tone-color:theme(colors.emerald.300)]',
        agua: 'bg-cyan-200/30 text-cyan-800 border-cyan-200 dark:bg-cyan-200/15 dark:text-cyan-200 dark:border-cyan-200/70 [--tone-color:theme(colors.cyan.200)]',
        celeste:
          'bg-sky-300/30 text-sky-800 border-sky-300 dark:bg-sky-300/15 dark:text-sky-200 dark:border-sky-300/70 [--tone-color:theme(colors.sky.300)]',
        lavanda:
          'bg-violet-300/30 text-violet-800 border-violet-300 dark:bg-violet-300/15 dark:text-violet-200 dark:border-violet-300/70 [--tone-color:theme(colors.violet.300)]',
        lilas:
          'bg-purple-300/30 text-purple-800 border-purple-300 dark:bg-purple-300/15 dark:text-purple-200 dark:border-purple-300/70 [--tone-color:theme(colors.purple.300)]',
        'rosa-bebe':
          'bg-pink-300/30 text-pink-800 border-pink-300 dark:bg-pink-300/15 dark:text-pink-200 dark:border-pink-300/70 [--tone-color:theme(colors.pink.300)]',
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
