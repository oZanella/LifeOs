import { Home } from '@/features/home/ui/view/home';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Life Os - Home',
  description: 'Home do sistema Life Os',
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session?.value) {
    redirect('/login');
  }

  return <Home />;
}
