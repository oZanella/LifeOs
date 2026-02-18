import { Dashboard } from '@/features/dashboard/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windel CRM - Dashboard',
  description: 'Dashboard',
};

export default function DashboardPage() {
  return <Dashboard />;
}
