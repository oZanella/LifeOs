'use client';

import { BadgeTone } from '@/components/ui/badge';

interface MetaProps {
  tone?: BadgeTone;
}

export function Meta({ tone = 'secondary' }: MetaProps) {
  return (
    <div data-tone={tone}>
      <h1 style={{ color: 'var(--tone-color)' }}>Meta</h1>
    </div>
  );
}
