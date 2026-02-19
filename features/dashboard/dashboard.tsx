'use client';

import { PageContainer } from '@/components/page/page-container';
import { DashboardHeader } from './components/dashboard-header';
import { dashboard_config } from './dashboard-config';
import { user_config } from '../home/home-user-config';

export function Dashboard() {
  const dashboardData = user_config.name;

  const personaLabel = 'Dashboard ';

  return (
    <PageContainer className="bg-background">
      <DashboardHeader
        moduloLabel={personaLabel}
        usuarioLabel={dashboardData}
        periodoLabel={''}
        tone={dashboard_config.tone}
      />
    </PageContainer>
  );
}
