'use client';

import { Badge, type BadgeTone } from '@/components/ui/badge';

type DashboardHeaderProps = {
  moduloLabel: string;
  usuarioLabel: string;
  periodoLabel: string;
  tone?: BadgeTone;
};

export function DashboardHeader({
  moduloLabel,
  usuarioLabel,
  tone = 'primary',
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-2 sm:flex-row items-center justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Dashboard
          </h1>
          <Badge variant="subtle" tone={tone}>
            {moduloLabel}
          </Badge>
        </div>
        <p className="text-pretty text-muted-foreground">
          Bem vindo, {usuarioLabel}
        </p>
      </div>
    </div>
  );
}
