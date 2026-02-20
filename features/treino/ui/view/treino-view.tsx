'use client';

import { BadgeTone } from '@/components/ui/badge';

interface TreinoProps {
  tone?: BadgeTone;
}

export function Treino({ tone = 'accent' }: TreinoProps) {
  return (
    <div data-tone={tone}>
      <h1 style={{ color: 'var(--tone-color)' }}>Treino</h1>
    </div>
  );
}
