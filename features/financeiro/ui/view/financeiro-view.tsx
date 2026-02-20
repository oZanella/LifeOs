'use client';

import { BadgeTone } from '@/components/ui/badge';

interface FinanceiroProps {
  tone?: BadgeTone;
}

export function Financeiro({ tone = 'success' }: FinanceiroProps) {
  return (
    <div data-tone={tone}>
      <h1 style={{ color: 'var(--tone-color)' }}>Financeiro</h1>
    </div>
  );
}
