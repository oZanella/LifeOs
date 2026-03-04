'use client';

import { PageContainer } from '@/components/page/page-container';
import { BadgeTone } from '@/components/ui/badge';
import { FinanceiroProvider } from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroStats } from '../components/financeiro-stats';
import { FinanceiroGrid } from '../components/financeiro-grid';

interface FinanceiroProps {
  tone?: BadgeTone;
}

export function Financeiro({ tone = 'success' }: FinanceiroProps) {
  return (
    <FinanceiroProvider>
      <div data-tone={tone}>
        <PageContainer className="bg-background gap-2 pb-4">
          <FinanceiroGrid tone={tone} />
          <FinanceiroStats tone={tone} />
        </PageContainer>
      </div>
    </FinanceiroProvider>
  );
}
