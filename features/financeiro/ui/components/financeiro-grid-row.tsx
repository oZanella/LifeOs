'use client';

import { TrendingDown, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
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
  isReadOnly?: boolean;
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
  isReadOnly = false,
}: FinanceiroGridRowProps) {
  return (
    <TableRow className={cn(isSelected && 'bg-muted/60')}>
      <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {format(new Date(`${entry.date}T12:00:00`), 'dd/MM/yyyy')}
      </TableCell>

      <TableCell className="text-sm whitespace-normal">
        {entry.description}
      </TableCell>

      <TableCell>
        {isSelectionMode || isReadOnly ? (
          <span className="text-xs text-muted-foreground">
            {categories.find((item) => item.id === entry.categoryId)?.name ??
              'Sem categoria'}
          </span>
        ) : (
          <FinanceiroCategoryCell
            entry={entry}
            categories={categories}
            onQuickCategoryChange={onQuickCategoryChange}
          />
        )}
      </TableCell>

      <TableCell className="text-right">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums whitespace-nowrap',
            entry.type === 'receita'
              ? 'text-emerald-600 dark:text-emerald-400'
              : entry.type === 'investimento'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400',
          )}
        >
          {formatCurrency(entry.amount)}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex justify-center">
          {entry.type === 'receita' ? (
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
          ) : entry.type === 'investimento' ? (
            <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
          ) : (
            <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
          )}
        </div>
      </TableCell>

      <TableCell>
        <div
          className={cn(
            'flex justify-center',
            isSelectionMode || isReadOnly
              ? 'cursor-not-allowed opacity-40'
              : 'cursor-pointer',
          )}
          onClick={() =>
            !isSelectionMode &&
            !isReadOnly &&
            onToggleFixed(entry.id, entry.isFixed)
          }
        >
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              entry.isFixed
                ? 'bg-amber-500'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
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
      </TableCell>

      <TableCell>
        <div className="flex justify-center">
          {!isSelectionMode && !isReadOnly && entry.type !== 'receita' && (
            <Checkbox
              checked={entry.isPaid}
              onCheckedChange={(checked) =>
                onTogglePaid(entry.id, Boolean(checked))
              }
              className="cursor-pointer"
            />
          )}
          {isReadOnly && entry.type !== 'receita' && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Pago
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-7 w-7 text-muted-foreground hover:text-blue-600',
              isSelectionMode || entry.parentId || isReadOnly
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer',
            )}
            onClick={() =>
              !isSelectionMode && !entry.parentId && !isReadOnly && onStartEdit()
            }
            title={
              isReadOnly
                ? 'Lançamento pago preservado'
                : entry.parentId
                  ? 'Registro automático (não editável)'
                  : 'Editar'
            }
          >
            <Edit2 size={14} />
          </Button>

          {!isSelectionMode && !isReadOnly && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 size={14} />
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
      </TableCell>
    </TableRow>
  );
});
