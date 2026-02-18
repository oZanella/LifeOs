import { Tarefa } from '@/features/tarefa/ui/view/tarefa';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windel CRM - Tarefa',
  description: 'Tarefa',
};

export default function TarefaPage() {
  return <Tarefa />;
}
