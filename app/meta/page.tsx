import { Meta } from '@/features/meta/ui/view/meta-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Meta',
  description: 'Meta',
};

export default function MetaPage() {
  return <Meta tone="warning" />;
}
