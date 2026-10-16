import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './auth-provider/auth.provider';

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
        {/* Toasts render their own styled card (see lib/toast.tsx). */}
        <Toaster
          toastOptions={{
            style: {
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
              padding: '0',
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
}
