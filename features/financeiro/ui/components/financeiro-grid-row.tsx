'use client';

import {
  Calendar as CalendarIcon,
  Check,
  Edit2,
  TrendingDown,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Category,
  FinancialEntry,
} from '@/features/financeiro/application/context/financeiro-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceiroCategoryCell } from './financeiro-category-cell';

interface FinanceiroGridRowProps {
  entry: FinancialEntry;
  categories: Category[];
  isEditing: boolean;
  editForm: Partial<FinancialEntry>;
  amountInput: string;
  formatCurrency: (value: number) => string;
  parseCurrencyInput: (value: string) => number;
  onChangeForm: (nextForm: Partial<FinancialEntry>) => void;
  onAmountInputChange: (nextValue: string) => void;
  onQuickCategoryChange: (entryId: string, categoryId: string) => void;
  onToggleFixed: (entryId: string, isFixed: boolean) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  autoFocusDescription?: boolean;
}

export function FinanceiroGridRow({
  entry,
  categories,
  isEditing,
  editForm,
  amountInput,
  formatCurrency,
  parseCurrencyInput,
  onChangeForm,
  onAmountInputChange,
  onQuickCategoryChange,
  onToggleFixed,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  autoFocusDescription = false,
}: FinanceiroGridRowProps) {
  return (
    <tr className="group hover:bg-white/5 transition-colors">
      <td className="px-4 py-2">
        {isEditing ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'w-full justify-start text-left font-normal h-8 text-xs cursor-pointer',
                  !editForm.date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {editForm.date ? (
                  format(new Date(`${editForm.date}T12:00:00`), 'dd/MM/yyyy')
                ) : (
                  <span>Data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  editForm.date
                    ? new Date(`${editForm.date}T12:00:00`)
                    : undefined
                }
                onSelect={(date) =>
                  onChangeForm({
                    ...editForm,
                    date: date ? format(date, 'yyyy-MM-dd') : '',
                  })
                }
                initialFocus
                locale={ptBR}
                className="cursor-pointer"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <span className="text-xs font-medium tabular-nums">
            {format(new Date(`${entry.date}T12:00:00`), 'dd/MM/yyyy')}
          </span>
        )}
      </td>

      <td className="px-4 py-2">
        {isEditing ? (
          <Input
            autoFocus={autoFocusDescription}
            className="h-8 text-xs bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color)"
            value={editForm.description || ''}
            onChange={(event) =>
              onChangeForm({ ...editForm, description: event.target.value })
            }
          />
        ) : (
          <span className="text-sm">{entry.description}</span>
        )}
      </td>

      <td className="px-4 py-2">
        {isEditing ? (
          <Select
            value={String(editForm.categoryId || '')}
            onValueChange={(categoryId) =>
              onChangeForm({ ...editForm, categoryId })
            }
          >
            <SelectTrigger className="h-8 w-full text-xs bg-background border-border/40 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="cursor-pointer text-xs"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <FinanceiroCategoryCell
            entry={entry}
            categories={categories}
            onQuickCategoryChange={onQuickCategoryChange}
          />
        )}
      </td>

      <td className="px-4 py-2 text-right">
        {isEditing ? (
          <Input
            type="text"
            inputMode="decimal"
            className="h-8 text-xs bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color) tabular-nums text-right"
            value={amountInput}
            onChange={(event) => {
              const numericValue = parseCurrencyInput(event.target.value);
              onChangeForm({ ...editForm, amount: numericValue });
              onAmountInputChange(formatCurrency(numericValue));
            }}
          />
        ) : (
          <span
            className={cn(
              'text-sm font-black tabular-nums whitespace-nowrap',
              entry.type === 'receita' ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {formatCurrency(entry.amount)}
          </span>
        )}
      </td>

      <td className="px-4 py-2 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              className={cn(
                'p-1 rounded cursor-pointer',
                editForm.type === 'receita'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'text-muted-foreground',
              )}
              onClick={() => onChangeForm({ ...editForm, type: 'receita' })}
            >
              <TrendingUp size={14} />
            </button>
            <button
              className={cn(
                'p-1 rounded cursor-pointer',
                editForm.type === 'despesa'
                  ? 'bg-red-500/20 text-red-500'
                  : 'text-muted-foreground',
              )}
              onClick={() => onChangeForm({ ...editForm, type: 'despesa' })}
            >
              <TrendingDown size={14} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            {entry.type === 'receita' ? (
              <TrendingUp size={14} className="text-emerald-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
          </div>
        )}
      </td>

      <td className="px-4 py-2 text-center">
        {isEditing ? (
          <input
            type="checkbox"
            className="accent-(--tone-color) cursor-pointer"
            checked={Boolean(editForm.isFixed)}
            onChange={(event) =>
              onChangeForm({ ...editForm, isFixed: event.target.checked })
            }
          />
        ) : (
          <div
            className="flex justify-center cursor-pointer"
            onClick={() => onToggleFixed(entry.id, entry.isFixed)}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                entry.isFixed
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-125'
                  : 'bg-gray-700 hover:bg-gray-600',
              )}
            />
          </div>
        )}
      </td>

      <td className="px-4 py-2">
        <div className="flex items-center justify-center gap-2 opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                onClick={onSaveEdit}
              >
                <Check size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-500 hover:bg-red-500/10 cursor-pointer"
                onClick={onCancelEdit}
              >
                <X size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-blue-500 cursor-pointer"
                onClick={onStartEdit}
              >
                <Edit2 size={14} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer"
                onClick={onDelete}
              >
                <Trash2 size={14} />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
