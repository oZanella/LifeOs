'use client';

import { Badge } from '@/components/ui/badge';

type DashboardHeaderProps = {
  personaLabel: string;
  visaoAtual: string;
  periodoLabel: string;
};

export function DashboardHeader({
  personaLabel,
  visaoAtual,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-2 sm:flex-row items-center justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Dashboard
          </h1>
          <Badge variant="outline">{personaLabel}</Badge>
        </div>
        <p className="text-pretty text-muted-foreground">
          Bem vindo, {visaoAtual}
        </p>
      </div>
    </div>
  );
}
