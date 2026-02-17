import { DashboardFinanceiro } from '@/features/dashboard/financeiro/ui/view/dashboard-financeiro';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windel CRM - Dashboard',
  description: 'Dashboard',
};

export default function DashboardPage() {
  return <DashboardFinanceiro />;
}
