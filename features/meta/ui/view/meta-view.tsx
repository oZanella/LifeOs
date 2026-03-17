'use client';

import { BadgeTone } from '@/components/ui/badge';
import { PageContainer } from '@/components/page/page-container';
import { MetaProvider } from '@/features/meta/application/context/meta-context';
import { MetaGrid } from '../components/meta-grid';

interface MetaProps {
  tone?: BadgeTone;
}

export function Meta({ tone = 'warning' }: MetaProps) {
  return (
    <MetaProvider>
      <section
        data-tone={tone}
        className="flex flex-col sm:h-full sm:max-h-full sm:min-h-0"
      >
        <PageContainer className="bg-background gap-6 pb-4 flex-1 sm:min-h-0 sm:overflow-hidden">
          <div className="flex-1 sm:min-h-0 sm:overflow-auto pr-1 custom-scrollbar">
            <MetaGrid />
          </div>
        </PageContainer>
      </section>
    </MetaProvider>
  );
}
