import { Financeiro } from '@/features/financeiro/ui/view/financeiro';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Financeiro',
  description: 'Financeiro',
};

export default function FinanceiroPage() {
  return <Financeiro />;
}
