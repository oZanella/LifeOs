import { Financeiro } from '@/features/financeiro/ui/view/financeiro-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Financeiro',
  description: 'Financeiro',
};

export default function FinanceiroPage() {
  return <Financeiro tone="success" />;
}
