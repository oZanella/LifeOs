import { Meta } from '@/features/meta/ui/view/meta';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windel CRM - Tarefa',
  description: 'Tarefa',
};

export default function MetaPage() {
  return <Meta />;
}
