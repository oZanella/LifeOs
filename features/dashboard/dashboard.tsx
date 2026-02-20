import { PageContainer } from '@/components/page/page-container';
import { DashboardHeader } from './components/dashboard-header';
import { user_config } from '../home/home-user-config';
import { BadgeTone } from '@/components/ui/badge';

interface DashboardProps {
  tone?: BadgeTone;
}

export function Dashboard({ tone = 'primary' }: DashboardProps) {
  const dashboardData = user_config.name;

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
