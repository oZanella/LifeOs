'use client';

import { PageContainer } from '@/components/page/page-container';
import { DashboardHeader } from './components/dashboard-header';
import { useHomeUserConfig } from '../home/home-user-config';
import { BadgeTone } from '@/components/ui/badge';

interface DashboardProps {
  tone?: BadgeTone;
}

export function Dashboard({ tone = 'primary' }: DashboardProps) {
  const userConfig = useHomeUserConfig();
  const dashboardData = userConfig.name;

  const personaLabel = 'Dashboard ';

  return (
    <PageContainer className="bg-background">
      <DashboardHeader
        moduloLabel={personaLabel}
        usuarioLabel={dashboardData}
        periodoLabel={''}
        tone={tone}
      />
    </PageContainer>
  );
}
