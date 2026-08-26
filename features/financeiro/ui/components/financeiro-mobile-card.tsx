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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge, BadgeTone } from '@/components/ui/badge';
import { memo } from 'react';

interface FinanceiroMobileCardProps {
  entry: FinancialEntry;
  categories: Category[];
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: () => void;
  formatCurrency: (value: number) => string;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleFixed: (entryId: string, isFixed: boolean) => void;
  onTogglePaid: (entryId: string, isPaid: boolean) => void;
  isReadOnly?: boolean;
}

export const FinanceiroMobileCard = memo(function FinanceiroMobileCard({
  entry,
  categories,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  formatCurrency,
  onStartEdit,
  onDelete,
  onToggleFixed,
  onTogglePaid,
  isReadOnly = false,
}: FinanceiroMobileCardProps) {
  const category = categories.find((c) => c.id === entry.categoryId);
  const isReceita = entry.type === 'receita';
  const isInvestimento = entry.type === 'investimento';
  const amountColor = isReceita
    ? 'text-emerald-600 dark:text-emerald-400'
    : isInvestimento
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div
      className={cn(
        'relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors',
        isSelected ? 'border-primary/40 bg-primary/5' : 'border-border',
      )}
    >
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          isReceita
            ? 'bg-emerald-500'
            : isInvestimento
              ? 'bg-blue-500'
              : 'bg-red-500',
        )}
      />

      <div className="flex w-full min-w-0 flex-col gap-3 py-4 pr-4 pl-5">
        <div className="flex w-full min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="block w-full truncate text-sm font-medium leading-tight">
              {entry.description}
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {format(new Date(`${entry.date}T12:00:00`), "dd 'de' MMM", {
                  locale: ptBR,
                })}
              </span>
              {category && (
                <Badge
                  tone={category.tone as BadgeTone}
                  variant="subtle"
                  className="h-4 min-w-0 truncate border-none px-1.5 text-[10px] font-medium"
                >
                  {category.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex max-w-[40%] shrink-0 flex-col items-end">
            <span
              className={cn(
                'w-full truncate pr-0.5 text-right text-base font-semibold tabular-nums',
                amountColor,
              )}
            >
              {isReceita ? '+' : isInvestimento ? '+' : '-'}
              {formatCurrency(entry.amount)
                .replace('R$ ', '')
                .replace('R$ ', '')}
            </span>
          </div>
        </div>

        <div className="flex w-full min-w-0 items-center justify-between gap-2 border-t border-border pt-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                'flex items-center gap-1 truncate text-xs font-medium',
                amountColor,
              )}
            >
              {isReceita ? (
                <TrendingUp size={12} className="shrink-0" />
              ) : isInvestimento ? (
                <TrendingUpDown size={12} className="shrink-0" />
              ) : (
                <TrendingDown size={12} className="shrink-0" />
              )}
              <span className="truncate">
                {isReceita
                  ? 'Receita'
                  : isInvestimento
                    ? 'Investimento'
                    : 'Despesa'}
              </span>
            </span>

            {entry.isFixed && (
              <button
                type="button"
                className={cn(
                  'flex shrink-0 items-center gap-1',
                  isSelectionMode || entry.parentId || isReadOnly
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer',
                )}
                onClick={() =>
                  !isSelectionMode &&
                  !entry.parentId &&
                  !isReadOnly &&
                  onToggleFixed(entry.id, entry.isFixed)
                }
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  Fixo
                </span>
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!isSelectionMode && !isReadOnly && entry.type !== 'receita' && (
              <div className="mr-1 flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-1.5 py-0.5">
                <Checkbox
                  checked={entry.isPaid}
                  onCheckedChange={(checked) =>
                    onTogglePaid(entry.id, Boolean(checked))
                  }
                  className="h-3.5 w-3.5 cursor-pointer"
                />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Pago
                </span>
              </div>
            )}

            {isReadOnly && entry.type !== 'receita' && (
              <div className="mr-1 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5">
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Pago
                </span>
              </div>
            )}

            {!isReadOnly && (
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  'h-7 w-7 rounded-lg text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600',
                  isSelectionMode || entry.parentId
                    ? 'opacity-20 cursor-not-allowed'
                    : 'cursor-pointer',
                )}
                onClick={() =>
                  !isSelectionMode && !entry.parentId && onStartEdit()
                }
              >
                <Edit2 size={12} />
              </Button>
            )}

            {!isSelectionMode && !isReadOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                onClick={onDelete}
              >
                <Trash2 size={12} />
              </Button>
            )}

            {isSelectionMode && (
              <div className="flex h-7 w-7 items-center justify-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggleSelection}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
