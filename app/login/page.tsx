import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants';
import { LoginView } from './login-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Life Os - Login',
  description: 'Faça login no sistema Life Os',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (session?.value) {
    redirect('/');
  }

  return <LoginView />;
}
