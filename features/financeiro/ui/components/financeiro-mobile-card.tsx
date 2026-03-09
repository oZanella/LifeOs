'use client';

import {
  Edit2,
  TrendingDown,
  TrendingUp,
  Trash2,
  TrendingUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Category,
  FinancialEntry,
} from '@/features/financeiro/application/context/financeiro-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge, BadgeTone } from '@/components/ui/badge';

interface FinanceiroMobileCardProps {
  entry: FinancialEntry;
  categories: Category[];
  formatCurrency: (value: number) => string;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleFixed: (entryId: string, isFixed: boolean) => void;
}

export function FinanceiroMobileCard({
  entry,
  categories,
  formatCurrency,
  onStartEdit,
  onDelete,
  onToggleFixed,
}: FinanceiroMobileCardProps) {
  const category = categories.find((c) => c.id === entry.categoryId);
  const isReceita = entry.type === 'receita';
  const isInvestimento = entry.type === 'investimento';

  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden transition-all',
        isReceita
          ? 'border-emerald-500/20'
          : isInvestimento
            ? 'border-blue-700/20'
            : 'border-red-500/10',
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl',
          isReceita
            ? 'bg-emerald-500'
            : isInvestimento
              ? 'bg-blue-700'
              : 'bg-red-500',
        )}
      />

      <div className="pl-4 pr-3 py-3 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm font-semibold truncate leading-tight">
            {entry.description}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {format(new Date(`${entry.date}T12:00:00`), "dd 'de' MMM", {
                locale: ptBR,
              })}
            </span>

            {category && (
              <>
                <span className="text-muted-foreground/40 text-[10px]">·</span>
                <Badge
                  tone={category.tone as BadgeTone}
                  variant="subtle"
                  className="text-[10px] uppercase font-bold tracking-tight border-none"
                >
                  {category.name}
                </Badge>
              </>
            )}

            <span className="text-muted-foreground/40 text-[10px]">·</span>
            <span
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium',
                isReceita
                  ? 'text-emerald-500'
                  : isInvestimento
                    ? 'text-blue-700'
                    : 'text-red-500',
              )}
            >
              {isReceita ? (
                <TrendingUp size={11} />
              ) : isInvestimento ? (
                <TrendingUpDown size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              {isReceita
                ? 'Receita'
                : isInvestimento
                  ? 'Investimento'
                  : 'Despesa'}
            </span>

            {entry.isFixed && (
              <>
                <span className="text-muted-foreground/40 text-[10px]">·</span>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1',
                    entry.parentId
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer',
                  )}
                  onClick={() =>
                    !entry.parentId && onToggleFixed(entry.id, entry.isFixed)
                  }
                  title={entry.parentId ? 'Replicação (bloqueada)' : undefined}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                  <span className="text-[11px] text-amber-500 font-medium">
                    Fixo
                  </span>
                </button>
              </>
            )}

            {!entry.isFixed && (
              <>
                <span className="text-muted-foreground/40 text-[10px]">·</span>
                <button
                  type="button"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => onToggleFixed(entry.id, entry.isFixed)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-amber-500/50 transition-colors" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={cn(
              'text-base font-black tabular-nums leading-tight',
              isReceita
                ? 'text-emerald-500'
                : isInvestimento
                  ? 'text-blue-700'
                  : 'text-red-500',
            )}
          >
            {isReceita ? '+' : isInvestimento ? '+' : '-'}
            {formatCurrency(entry.amount)
              .replace('R$\u00a0', '')
              .replace('R$ ', '')}
          </span>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'h-7 w-7 text-muted-foreground hover:text-blue-500',
                entry.parentId
                  ? 'opacity-30 cursor-not-allowed'
                  : 'cursor-pointer',
              )}
              onClick={() => !entry.parentId && onStartEdit()}
              title={
                entry.parentId ? 'Registro automático (não editável)' : 'Editar'
              }
            >
              <Edit2 size={13} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
