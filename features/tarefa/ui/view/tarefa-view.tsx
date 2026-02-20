'use client';

import { BadgeTone } from '@/components/ui/badge';

interface TarefaProps {
  tone?: BadgeTone;
}

export function Tarefa({ tone = 'info' }: TarefaProps) {
  return (
    <div data-tone={tone}>
      <h1 style={{ color: 'var(--tone-color)' }}>Tarefa</h1>
    </div>
  );
}
