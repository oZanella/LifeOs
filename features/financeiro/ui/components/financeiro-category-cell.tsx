'use client';

import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Badge, BadgeTone } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Category,
  FinancialEntry,
} from '@/features/financeiro/application/context/financeiro-context';
import {
  getCategoryLabel,
  getRootCategories,
  getSubcategories,
  resolveCategory,
} from '@/features/financeiro/application/category-utils';
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
  const { parent } = resolveCategory(categories, entry.categoryId);
  const label = getCategoryLabel(categories, entry.categoryId);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setExpandedId(parent?.id ?? null);
  };

  const handleSelect = (categoryId: string) => {
    onQuickCategoryChange(entry.id, categoryId);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-opacity hover:opacity-80">
          {parent ? (
            <Badge
              tone={parent.tone as BadgeTone}
              variant="subtle"
              className="text-[10px] font-medium border-none"
            >
              {label}
            </Badge>
          ) : (
            <Badge
              variant="subtle"
              className="text-[10px] font-medium bg-gray-500/10 text-gray-500 border-none"
            >
              Sem Categoria
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {getRootCategories(categories).map((categoryItem) => {
            const children = getSubcategories(categories, categoryItem.id);
            const isExpanded = expandedId === categoryItem.id;

            return (
              <div key={categoryItem.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <CategoryOption
                    category={categoryItem}
                    isSelected={entry.categoryId === categoryItem.id}
                    onSelect={() => handleSelect(categoryItem.id)}
                  />
                  {children.length > 0 && (
                    <button
                      type="button"
                      aria-label={
                        isExpanded ? 'Ocultar subcategorias' : 'Mostrar subcategorias'
                      }
                      onClick={() =>
                        setExpandedId(isExpanded ? null : categoryItem.id)
                      }
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50"
                    >
                      <ChevronRight
                        size={12}
                        className={cn('transition-transform', isExpanded && 'rotate-90')}
                      />
                    </button>
                  )}
                </div>

                {isExpanded &&
                  children.map((child) => (
                    <div key={child.id} className="flex pl-4">
                      <CategoryOption
                        category={child}
                        isSelected={entry.categoryId === child.id}
                        onSelect={() => handleSelect(child.id)}
                      />
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CategoryOption({
  category,
  isSelected,
  onSelect,
}: {
  category: Category;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-1 items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer',
        isSelected ? 'bg-muted font-bold' : 'hover:bg-muted/50',
      )}
    >
      <div
        className={cn(
          'w-2 h-2 shrink-0 rounded-full',
          TONE_DOT_CLASSNAME[category.tone as AppBadgeTone] ?? 'bg-zinc-500',
        )}
      />
      <span className="truncate text-left">{category.name}</span>
      {isSelected && <Check size={12} className="ml-auto shrink-0" />}
    </button>
  );
}
