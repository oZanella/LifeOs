import { Toaster } from 'react-hot-toast';

import { ProviderTanStackQuery } from './tan-stack-query-provider/tan-stack-query.provider';
import { ToastProvider } from './hot-toast-provider/hot-toast.provider';

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProviderTanStackQuery>
      <ToastProvider>{children}</ToastProvider>
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
    </ProviderTanStackQuery>
  );
}
