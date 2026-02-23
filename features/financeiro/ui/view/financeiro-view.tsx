'use client';

import { PageContainer } from '@/components/page/page-container';
import { BadgeTone } from '@/components/ui/badge';
import { FinanceiroProvider } from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroStats } from '../components/financeiro-stats';
import { FinanceiroFilters } from '../components/financeiro-filters';
import { FinanceiroGrid } from '../components/financeiro-grid';
import { FinanceiroCategories } from '../components/financeiro-categories';

interface FinanceiroProps {
  tone?: BadgeTone;
}

export function Financeiro({ tone = 'success' }: FinanceiroProps) {
  return (
    <FinanceiroProvider>
      <div data-tone={tone}>
        <PageContainer className="bg-background gap-2 pb-10">
          <FinanceiroStats tone={tone} />
          <FinanceiroCategories tone={tone} />
          <FinanceiroFilters tone={tone} />
          <FinanceiroGrid tone={tone} />
        </PageContainer>
      </div>
    </FinanceiroProvider>
  );
}
