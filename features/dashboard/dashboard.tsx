'use client';

import { PageContainer } from '@/components/page/page-container';
import { DashboardHeader } from './components/dashboard-header';

export function Dashboard() {
  const dashboardData = 'Henrique Zanella';
  const {} = dashboardData;

  const personaLabel = 'Dashboard ';

  return (
    <PageContainer className="bg-background">
      <DashboardHeader
        personaLabel={personaLabel}
        visaoAtual={dashboardData}
        periodoLabel={''}
      />
    </PageContainer>
  );
}
