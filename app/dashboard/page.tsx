import { Dashboard } from '@/features/dashboard/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Dashboard',
  description: 'Dashboard',
};

export default function DashboardPage() {
  return <Dashboard />;
}
