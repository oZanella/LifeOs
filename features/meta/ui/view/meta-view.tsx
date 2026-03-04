'use client';

import { BadgeTone } from '@/components/ui/badge';

interface MetaProps {
  tone?: BadgeTone;
}

export function Meta({ tone = 'secondary' }: MetaProps) {
  return (
    <section
      data-tone={tone}
      className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-6"
    >
      <div
        className="rounded-xl border border-border/50 bg-linear-to-br from-background via-muted/30 to-background p-4 sm:p-6"
        style={{
          boxShadow:
            'inset 0 0 0 1px color-mix(in oklab, var(--tone-color) 18%, transparent)',
        }}
      >
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: 'var(--tone-color)' }}
        >
          Metas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina e acompanhe seus objetivos com melhor contraste no tema claro e
          escuro.
        </p>
      </div>
    </section>
  );
}
