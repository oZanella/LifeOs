import { Home } from '@/features/home/ui/view/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

// Access control lives in proxy.ts (redirects to /login without a session).
export default function HomePage() {
  return <Home />;
}
