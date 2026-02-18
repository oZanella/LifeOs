import { Treino } from '@/features/treino/ui/view/treino';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Treino',
  description: 'Treino',
};

export default function TreinoPage() {
  return <Treino />;
}
