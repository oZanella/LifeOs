'use client';

import { useState } from 'react';
import { BadgeTone } from '@/components/ui/badge';
import { PageContainer } from '@/components/page/page-container';
import {
  TreinoProvider,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';
import { TreinoGrid } from '../components/treino-grid';
import { TreinoDetail } from '../components/treino-detail';

interface TreinoProps {
  tone?: BadgeTone;
}

export function Treino({ tone = 'laranja' }: TreinoProps) {
  return (
    <TreinoProvider>
      <section
        data-tone={tone}
        className="flex flex-col sm:h-full sm:max-h-full sm:min-h-0"
      >
        <PageContainer className="bg-background gap-6 pb-4 flex-1 sm:min-h-0 sm:overflow-hidden">
          <div className="flex-1 sm:min-h-0 sm:overflow-auto pr-1 custom-scrollbar">
            <TreinoContent />
          </div>
        </PageContainer>
      </section>
    </TreinoProvider>
  );
}

function TreinoContent() {
  const { treinos } = useTreinoContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Falls back to the list when the open treino is deleted.
  const selected = treinos.find((t) => t.id === selectedId);

  if (selected) {
    return (
      <TreinoDetail treino={selected} onBack={() => setSelectedId(null)} />
    );
  }

  return <TreinoGrid onOpen={setSelectedId} />;
}
