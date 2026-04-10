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
      <div
        data-tone={tone}
        className="flex flex-col sm:h-full sm:max-h-full sm:min-h-0 w-full max-w-full overflow-x-hidden"
      >
        <PageContainer className="bg-background gap-2 pb-4 flex-1 sm:min-h-0 sm:overflow-hidden overflow-x-hidden">
          <div className="flex-1 sm:min-h-0 sm:overflow-auto pr-1 custom-scrollbar overflow-x-hidden">
            <FinanceiroGrid tone={tone} />
          </div>
        </PageContainer>
      </div>
    </FinanceiroProvider>
  );
}
