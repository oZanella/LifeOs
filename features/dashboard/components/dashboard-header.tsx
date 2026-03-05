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
    <div className="flex flex-col gap-1 sm:flex-row items-baseline justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight">Dashboard</h1>
          <Badge
            variant="subtle"
            tone={tone}
            className="text-[10px] px-1.5 h-4"
          >
            {moduloLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Bem vindo, {usuarioLabel}
        </p>
      </div>
    </div>
  );
}
