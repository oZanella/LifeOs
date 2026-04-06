'use client';

import { TrendingDown, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Category,
  FinancialEntry,
} from '@/features/financeiro/application/context/financeiro-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FinanceiroCategoryCell } from './financeiro-category-cell';
import { Checkbox } from '@/components/ui/checkbox';
import { memo } from 'react';

interface FinanceiroGridRowProps {
  entry: FinancialEntry;
  categories: Category[];
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: () => void;
  formatCurrency: (value: number) => string;
  onQuickCategoryChange: (entryId: string, categoryId: string) => void;
  onToggleFixed: (entryId: string, isFixed: boolean) => void;
  onTogglePaid: (entryId: string, isPaid: boolean) => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

export const FinanceiroGridRow = memo(function FinanceiroGridRow({
  entry,
  categories,
  isSelected,
  isSelectionMode,
  onToggleSelection,
  formatCurrency,
  onQuickCategoryChange,
  onToggleFixed,
  onTogglePaid,
  onStartEdit,
  onDelete,
}: FinanceiroGridRowProps) {
  return (
    <tr
      className={cn(
        'group transition-colors border-b border-border/10',
        isSelected ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-white/5',
      )}
    >
      <td className="px-4 py-2">
        <span className="text-xs font-medium tabular-nums">
          {format(new Date(`${entry.date}T12:00:00`), 'dd/MM/yyyy')}
        </span>
      </td>

      <td className="px-4 py-2">
        <span className="text-sm">{entry.description}</span>
      </td>

      <td className="px-4 py-2">
        {isSelectionMode ? (
          <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground">
            {categories.find((item) => item.id === entry.categoryId)?.name ??
              'Sem Categoria'}
          </span>
        ) : (
          <FinanceiroCategoryCell
            entry={entry}
            categories={categories}
            onQuickCategoryChange={onQuickCategoryChange}
          />
        )}
      </td>

      <td className="px-4 py-2 text-right">
        <span
          className={cn(
            'text-sm font-black tabular-nums whitespace-nowrap',
            entry.type === 'receita'
              ? 'text-emerald-500'
              : entry.type === 'investimento'
                ? 'text-blue-700'
                : 'text-red-500',
          )}
        >
          {formatCurrency(entry.amount)}
        </span>
      </td>

      <td className="px-4 py-2 text-center">
        <div className="flex justify-center">
          {entry.type === 'receita' ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : entry.type === 'investimento' ? (
            <TrendingUp size={14} className="text-blue-700" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
        </div>
      </td>

      <td className="px-4 py-2 text-center">
        <div
          className={cn(
            'flex justify-center',
            isSelectionMode ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
          )}
          onClick={() =>
            !isSelectionMode && onToggleFixed(entry.id, entry.isFixed)
          }
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              entry.isFixed
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-125'
                : 'bg-gray-700 hover:bg-gray-600',
              entry.parentId
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
            )}
            title={
              entry.parentId
                ? 'Replicação (bloqueada)'
                : entry.isFixed
                  ? 'Remover fixo'
                  : 'Marcar como fixo'
            }
          />
        </div>
      </td>

      <td className="px-4 py-2 text-center">
        <div className="flex justify-center">
          {!isSelectionMode && entry.type !== 'receita' && (
            <Checkbox
              checked={entry.isPaid}
              onCheckedChange={(checked) =>
                onTogglePaid(entry.id, Boolean(checked))
              }
              className="cursor-pointer"
            />
          )}
        </div>
      </td>

      <td className="px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-7 w-7 text-muted-foreground hover:text-blue-500',
              isSelectionMode || entry.parentId
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer',
            )}
            onClick={() =>
              !isSelectionMode && !entry.parentId && onStartEdit()
            }
            title={
              entry.parentId ? 'Registro automático (não editável)' : 'Editar'
            }
          >
            <Edit2 size={14} />
          </Button>

          {!isSelectionMode && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </Button>
          )}

          {isSelectionMode && (
            <div className="h-7 w-7 flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                className="cursor-pointer"
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});
