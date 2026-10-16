import { Treino } from '@/features/treino/ui/view/treino-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Treinos',
  description: 'Treinos',
};

export default function TreinoPage() {
  return <Treino tone="laranja" />;
}
