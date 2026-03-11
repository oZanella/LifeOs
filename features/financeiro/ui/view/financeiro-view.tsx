'use client';

import { PageContainer } from '@/components/page/page-container';
import { BadgeTone } from '@/components/ui/badge';
import { FinanceiroProvider } from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroGrid } from '../components/financeiro-grid';

interface FinanceiroProps {
  tone?: BadgeTone;
}

export function Financeiro({ tone = 'success' }: FinanceiroProps) {
  return (
    <FinanceiroProvider>
      <div data-tone={tone} className="flex flex-col h-full max-h-full min-h-0">
        <PageContainer className="bg-background gap-2 pb-4 flex-1 min-h-0 overflow-hidden">
          <FinanceiroGrid tone={tone} />
        </PageContainer>
      </div>
    </FinanceiroProvider>
  );
}
