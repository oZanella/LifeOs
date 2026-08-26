'use client';

import { useMemo } from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v);

export function DashboardUpcomingBills({
  hideValues = false,
}: {
  hideValues?: boolean;
}) {
  const { entries, categories, updateEntry } = useFinanceiroContext();

  const allUnpaid = useMemo(
    () =>
      entries
        .filter((e) => e.type === 'despesa' && !e.isPaid)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  );

  const upcoming = allUnpaid.slice(0, 8);
  const totalPending = allUnpaid.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between gap-2 shrink-0">
        <div>
          <p className="text-sm font-medium text-foreground">Contas a pagar</p>
          <p className="text-xs text-muted-foreground">
            {allUnpaid.length === 0
              ? 'Nenhuma pendência'
              : `${allUnpaid.length} pendente${allUnpaid.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {allUnpaid.length > 0 && (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
            {hideValues ? '••••••' : formatBRL(totalPending)}
          </span>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={28} className="text-emerald-500/40 mb-2" />
          <p className="text-sm text-muted-foreground">Tudo em dia por aqui.</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col divide-y divide-border overflow-y-auto custom-scrollbar">
          {upcoming.map((entry) => {
            const category = categories.find((c) => c.id === entry.categoryId);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <button
                  type="button"
                  onClick={() => updateEntry(entry.id, { isPaid: true })}
                  className="shrink-0 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  aria-label="Marcar como pago"
                  title="Marcar como pago"
                >
                  <Circle size={18} />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(`${entry.date}T12:00:00`), "dd 'de' MMM", {
                        locale: ptBR,
                      })}
                    </span>
                    {category && (
                      <Badge
                        tone={category.tone as BadgeTone}
                        variant="subtle"
                        className="h-4 border-none px-1.5 text-[10px] font-medium"
                      >
                        {category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
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
