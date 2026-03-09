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
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border/50 shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-black uppercase tracking-widest text-foreground">
            {message}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
            Por favor, aguarde
          </span>
        </div>
      </div>
    </div>
  );
}
