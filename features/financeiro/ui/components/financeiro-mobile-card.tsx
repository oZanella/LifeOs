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
}: FinanceiroMobileCardProps) {
  const category = categories.find((c) => c.id === entry.categoryId);
  const isReceita = entry.type === 'receita';
  const isInvestimento = entry.type === 'investimento';

  return (
    <div
      className={cn(
        'relative rounded-3xl border backdrop-blur-md overflow-hidden transition-all duration-300 w-full max-w-full min-w-0',
        isSelected
          ? 'bg-blue-500/15 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.01]'
          : 'bg-card/50 border-border/40 dark:bg-card/30 dark:border-border/10 shadow-sm hover:shadow-md',
        !isSelected &&
          (isReceita
            ? 'hover:border-emerald-500/30'
            : isInvestimento
              ? 'hover:border-blue-700/30'
              : 'hover:border-red-500/20'),
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl',
          isReceita
            ? 'bg-emerald-500'
            : isInvestimento
              ? 'bg-blue-700'
              : 'bg-red-500',
        )}
      />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3 min-w-0 w-full">
        <div className="flex items-start justify-between gap-3 min-w-0 w-full">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-sm font-black truncate leading-tight tracking-tight uppercase opacity-90 block w-full">
              {entry.description}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest tabular-nums opacity-60 shrink-0">
                {format(new Date(`${entry.date}T12:00:00`), "dd 'de' MMM", {
                  locale: ptBR,
                })}
              </span>
              {category && (
                <>
                  <span className="text-muted-foreground/30 text-[10px] shrink-0">
                    ·
                  </span>
                  <Badge
                    tone={category.tone as BadgeTone}
                    variant="subtle"
                    className="text-[9px] uppercase font-black tracking-widest border-none px-1.5 h-4 min-w-0 truncate"
                  >
                    {category.name}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 max-w-[40%]">
            <span
              className={cn(
                'text-lg font-black tabular-nums leading-none tracking-tighter italic truncate w-full text-right',
                isReceita
                  ? 'text-emerald-500 underline decoration-emerald-500/30 decoration-2 underline-offset-4'
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
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/10 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={cn(
                'flex items-center gap-1 text-[10px] font-black uppercase tracking-widest truncate',
                isReceita
                  ? 'text-emerald-500'
                  : isInvestimento
                    ? 'text-blue-700'
                    : 'text-red-500',
              )}
            >
              {isReceita ? (
                <TrendingUp size={12} strokeWidth={3} className="shrink-0" />
              ) : isInvestimento ? (
                <TrendingUpDown
                  size={12}
                  strokeWidth={3}
                  className="shrink-0"
                />
              ) : (
                <TrendingDown size={12} strokeWidth={3} className="shrink-0" />
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
                  'flex items-center gap-1 shrink-0',
                  isSelectionMode || entry.parentId
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer active:scale-95 transition-transform',
                )}
                onClick={() =>
                  !isSelectionMode &&
                  !entry.parentId &&
                  onToggleFixed(entry.id, entry.isFixed)
                }
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse shrink-0" />
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">
                  Fixo
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isSelectionMode && entry.type !== 'receita' && (
              <div className="flex items-center gap-1.5 mr-1 px-1.5 py-0.5 rounded-lg bg-muted/30 border border-border/10">
                <Checkbox
                  checked={entry.isPaid}
                  onCheckedChange={(checked) =>
                    onTogglePaid(entry.id, Boolean(checked))
                  }
                  className="h-3 w-3 rounded-md cursor-pointer border-muted-foreground/30 accent-emerald-500"
                />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Pago
                </span>
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'h-7 w-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl',
                isSelectionMode || entry.parentId
                  ? 'opacity-20 cursor-not-allowed'
                  : 'cursor-pointer active:scale-90 transition-all',
              )}
              onClick={() =>
                !isSelectionMode && !entry.parentId && onStartEdit()
              }
            >
              <Edit2 size={12} strokeWidth={2.5} />
            </Button>

            {!isSelectionMode && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer active:scale-90 transition-all"
                onClick={onDelete}
              >
                <Trash2 size={12} strokeWidth={2.5} />
              </Button>
            )}

            {isSelectionMode && (
              <div className="h-7 w-7 flex items-center justify-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggleSelection}
                  className="h-4 w-4 rounded-lg cursor-pointer border-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
