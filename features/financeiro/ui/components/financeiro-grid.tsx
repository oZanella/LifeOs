'use client';

import { useState } from 'react';
import { Filter, Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeTone } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FiltersType,
  FinancialEntry,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroCategories } from './financeiro-categories';
import { FinanceiroGridRow } from './financeiro-grid-row';
import { FinanceiroFilters } from './financeiro-filters';
import { FinanceiroEntryModal } from './financeiro-entry-modal';
import { FinanceiroMobileCard } from './financeiro-mobile-card';
import { FinanceiroStats } from './financeiro-stats';
import { FinanceiroRecurringModal } from './financeiro-recurring-modal';
import { FinanceiroConfirmDeleteModal } from './financeiro-confirm-delete-modal';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessingOverlay } from './processing-overlay';

export function FinanceiroGrid({ tone }: { tone?: BadgeTone }) {
  const {
    entries,
    filteredEntries,
    categories,
    filters,
    setFilters,
    loading,
    isProcessing,
    addEntry,
    updateEntry,
    deleteEntry,
    addRecurringEntries,
    deleteEntries,
  } = useFinanceiroContext();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    ids: string[];
    hasParent: boolean;
  }>({
    isOpen: false,
    ids: [],
    hasParent: false,
  });

  const [editingEntry, setEditingEntry] =
    useState<Partial<FinancialEntry> | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringTarget, setRecurringTarget] = useState<FinancialEntry | null>(
    null,
  );
  const [pendingFilters, setPendingFilters] = useState<FiltersType>(filters);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleOpenEdit = (entry: FinancialEntry) => {
    setEditingEntry(entry);
  };

  const handleOpenNew = () => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    setEditingEntry({
      date: `${year}-${month}-${day}`,
      description: '',
      categoryId: categories[0]?.id || '',
      amount: 0,
      type: 'despesa',
      isFixed: false,
    });
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleConfirmDelete = (ids: string[], hasParent: boolean) => {
    setDeleteConfirm({
      isOpen: true,
      ids,
      hasParent,
    });
  };

  const executeDelete = async () => {
    if (deleteConfirm.ids.length === 1) {
      await deleteEntry(deleteConfirm.ids[0]);
    } else if (deleteConfirm.ids.length > 1) {
      await deleteEntries(deleteConfirm.ids);
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      deleteConfirm.ids.forEach((id) => next.delete(id));
      return next;
    });
    setIsSelectionMode(false);
  };

  const handleSave = async (
    data: Partial<FinancialEntry>,
    installments?: number,
  ) => {
    if (data.id) {
      await updateEntry(data.id, data);
    } else {
      const entryData = {
        date: data.date ?? '',
        description: data.description ?? '',
        categoryId: data.categoryId ?? '',
        amount: data.amount ?? 0,
        type: data.type ?? 'despesa',
        isFixed: data.isFixed ?? false,
      };

      const createdId = await addEntry(entryData);

      if (createdId && (installments ?? 0) > 1) {
        const baseEntry: FinancialEntry = {
          id: createdId,
          ...entryData,
        };
        await addRecurringEntries(baseEntry, installments!);
      }
    }
    setEditingEntry(null);
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
    setIsSelectionMode((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-4">
      <ProcessingOverlay isOpen={isProcessing || loading} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap cursor-default">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
            Movimentações Financeiras
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer flex-1 sm:flex-none"
            disabled={isProcessing}
            onClick={() => {
              setPendingFilters(filters);
              setIsFiltersOpen(true);
            }}
          >
            <Filter size={14} />
            Filtros
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 cursor-pointer flex-1 sm:flex-none transition-all',
              isSelectionMode && 'bg-blue-500/10 border-blue-500 text-blue-500',
            )}
            disabled={isProcessing}
            onClick={handleToggleSelectionMode}
          >
            <CheckSquare size={14} />
            {isSelectionMode ? 'Cancelar' : 'Selecionar'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer flex-1 sm:flex-none"
            disabled={isProcessing}
            onClick={() => setIsCategoriesOpen(true)}
          >
            <Tags size={14} />
            Categorias
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNew}
            disabled={isProcessing}
            className="basis-full sm:basis-auto w-full sm:w-auto gap-2 border-dashed hover:border-solid transition-all cursor-pointer"
            style={{
              borderColor: 'var(--tone-color)',
              color: 'var(--tone-color)',
            }}
          >
            <Plus size={14} />
            Novo lançamento
          </Button>
        </div>
      </div>

      <FinanceiroStats tone={tone} />

      <div className="flex sm:hidden flex-col gap-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card/30 p-4 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground italic text-sm">
            Nenhuma transação encontrada para este período.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <FinanceiroMobileCard
              key={entry.id}
              entry={entry}
              categories={categories}
              formatCurrency={formatCurrency}
              isSelectionMode={isSelectionMode}
              onToggleFixed={(entryId, isFixed) => {
                if (entry.parentId) return; // Locked if it's a child of recurring

                if (!isFixed) {
                  setRecurringTarget(entry);
                  setIsRecurringModalOpen(true);
                } else {
                  updateEntry(entryId, { isFixed: false });
                }
              }}
              onToggleSelection={() => toggleOne(entry.id)}
              isSelected={selectedIds.has(entry.id)}
              onStartEdit={() => handleOpenEdit(entry)}
              onDelete={() =>
                handleConfirmDelete(
                  [entry.id],
                  entry.isFixed && !entry.parentId,
                )
              }
            />
          ))
        )}
      </div>

      <div className="hidden sm:block rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden overflow-x-auto custom-scrollbar min-h-65">
        <table className="w-full text-left border-collapse min-w-230 cursor-default">
          <thead>
            <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40">
              <th className="px-4 py-3 w-40">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 w-40">Categoria</th>
              <th className="px-4 py-3 w-32">Valor</th>
              <th className="px-4 py-3 w-24 text-center">Tipo</th>
              <th className="px-4 py-3 w-20 text-center">Fixo</th>
              <th className="px-4 py-3 w-32 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-4 flex justify-center">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Skeleton className="h-4 w-8 mx-auto" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Skeleton className="h-8 w-24 mx-auto" />
                  </td>
                </tr>
              ))
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground italic text-sm"
                >
                  Nenhuma transação encontrada para este período.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <FinanceiroGridRow
                  key={entry.id}
                  entry={entry}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(entry.id)}
                  onToggleSelection={() => toggleOne(entry.id)}
                  categories={categories}
                  formatCurrency={formatCurrency}
                  onQuickCategoryChange={(entryId, categoryId) =>
                    updateEntry(entryId, { categoryId })
                  }
                  onToggleFixed={(entryId, isFixed) => {
                    if (entry.parentId) return; // Locked if it's a child of recurring

                    if (!isFixed) {
                      setRecurringTarget(entry);
                      setIsRecurringModalOpen(true);
                    } else {
                      updateEntry(entryId, { isFixed: false });
                    }
                  }}
                  onStartEdit={() => handleOpenEdit(entry)}
                  onDelete={() =>
                    handleConfirmDelete(
                      [entry.id],
                      entry.isFixed && !entry.parentId,
                    )
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingEntry !== null && (
        <FinanceiroEntryModal
          entry={editingEntry}
          categories={categories}
          onSave={(data, inst) => void handleSave(data, inst)}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {isFiltersOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar filtros"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-pointer"
            onClick={() => setIsFiltersOpen(false)}
          />
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border/50 bg-background p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Filtros</h3>
              </div>
              <FinanceiroFilters
                tone={tone}
                filters={pendingFilters}
                setFilters={setPendingFilters}
              />
              <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto px-6 cursor-pointer"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  Voltar
                </Button>
                <Button
                  size="sm"
                  className="w-full sm:w-auto px-8 cursor-pointer font-bold"
                  onClick={() => {
                    setFilters(pendingFilters);
                    setIsFiltersOpen(false);
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoriesOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar categorias"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px] cursor-pointer"
            onClick={() => setIsCategoriesOpen(false)}
          />
          <div className="relative z-10 flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border/50 bg-background p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Categorias
                </h3>
              </div>
              <FinanceiroCategories
                tone={tone}
                onApplyAction={() => setIsCategoriesOpen(false)}
                onCancelAction={() => setIsCategoriesOpen(false)}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
      {isRecurringModalOpen && recurringTarget && (
        <FinanceiroRecurringModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          description={recurringTarget.description}
          onConfirm={(months) => addRecurringEntries(recurringTarget, months)}
        />
      )}
      <FinanceiroConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        count={deleteConfirm.ids.length}
        hasParent={deleteConfirm.hasParent}
      />

      {selectedIds.size > 0 && (
        <div className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl overflow-hidden relative">
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: 'var(--tone-color)' }}
            />

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black tabular-nums border border-border/40"
                style={{
                  color: 'var(--tone-color)',
                  backgroundColor:
                    'color-mix(in srgb, var(--tone-color) 15%, transparent)',
                }}
              >
                {selectedIds.size}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Selecionados
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                onClick={() => setSelectedIds(new Set())}
              >
                Limpar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-4 text-[10px] uppercase font-black tracking-wider cursor-pointer shadow-sm transition-all active:scale-95"
                onClick={() => {
                  const ids = Array.from(selectedIds);
                  const hasParent = entries
                    .filter((e) => ids.includes(e.id))
                    .some((e) => e.isFixed && !e.parentId);
                  handleConfirmDelete(ids, hasParent);
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
