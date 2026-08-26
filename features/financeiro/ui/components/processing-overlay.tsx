'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export function ProcessingOverlay({
  isOpen,
  message = 'Processando...',
}: ProcessingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-8 py-6 shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {message}
          </span>
          <span className="text-xs text-muted-foreground">
            Por favor, aguarde
          </span>
        </div>
      </div>
    </div>
  );
}
