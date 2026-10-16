import { LoginView } from './login-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

// proxy.ts sends users who already have a session back to the home page.
export default function LoginPage() {
  return <LoginView />;
}
