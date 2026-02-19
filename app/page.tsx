import { Home } from '@/features/home/ui/view/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Home',
  description: 'Home do sistema Life Os',
};

export default function HomePage() {
  return <Home />;
}
