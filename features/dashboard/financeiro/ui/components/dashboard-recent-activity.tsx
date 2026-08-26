'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, TrendingUpDown } from 'lucide-react';
import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v);

export function DashboardRecentActivity({
  hideValues = false,
}: {
  hideValues?: boolean;
}) {
  const { entries } = useFinanceiroContext();

  const recent = useMemo(() => entries.slice(0, 8), [entries]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col h-full">
      <p className="mb-3 shrink-0 text-sm font-medium text-foreground">
        Últimos lançamentos
      </p>

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum lançamento ainda.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col divide-y divide-border overflow-y-auto custom-scrollbar">
          {recent.map((entry) => {
            const isReceita = entry.type === 'receita';
            const isInvestimento = entry.type === 'investimento';
            const color = isReceita
              ? 'text-emerald-600 dark:text-emerald-400'
              : isInvestimento
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400';
            const bg = isReceita
              ? 'bg-emerald-500/10'
              : isInvestimento
                ? 'bg-blue-500/10'
                : 'bg-red-500/10';
            const Icon = isReceita
              ? TrendingUp
              : isInvestimento
                ? TrendingUpDown
                : TrendingDown;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    bg,
                    color,
                  )}
                >
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {entry.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(`${entry.date}T12:00:00`), "dd 'de' MMM", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    color,
                  )}
                >
                  {hideValues ? '••••' : formatBRL(entry.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
