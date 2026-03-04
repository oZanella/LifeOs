'use client';

import { Check } from 'lucide-react';
import { Badge, BadgeTone } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Category, FinancialEntry } from '@/features/financeiro/application/context/financeiro-context';
import { AppBadgeTone, TONE_DOT_CLASSNAME } from '@/lib/tone-options';
import { cn } from '@/lib/utils';

interface FinanceiroCategoryCellProps {
  entry: FinancialEntry;
  categories: Category[];
  onQuickCategoryChange: (entryId: string, categoryId: string) => void;
}

export function FinanceiroCategoryCell({
  entry,
  categories,
  onQuickCategoryChange,
}: FinanceiroCategoryCellProps) {
  const category = categories.find((item) => item.id === entry.categoryId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-opacity hover:opacity-80">
          {category ? (
            <Badge
              tone={category.tone as BadgeTone}
              variant="subtle"
              className="text-[10px] uppercase font-bold tracking-tight border-none"
            >
              {category.name}
            </Badge>
          ) : (
            <Badge
              variant="subtle"
              className="text-[10px] uppercase font-bold tracking-tight bg-gray-500/10 text-gray-500 border-none"
            >
              Sem Categoria
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {categories.map((categoryItem) => (
            <button
              key={categoryItem.id}
              onClick={() => onQuickCategoryChange(entry.id, categoryItem.id)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer',
                entry.categoryId === categoryItem.id
                  ? 'bg-muted font-bold'
                  : 'hover:bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  TONE_DOT_CLASSNAME[categoryItem.tone as AppBadgeTone] ??
                    'bg-zinc-500',
                )}
              />
              {categoryItem.name}
              {entry.categoryId === categoryItem.id && (
                <Check size={12} className="ml-auto" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
