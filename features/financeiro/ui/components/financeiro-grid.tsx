'use client';

import { useState } from 'react';
import { Filter, Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeTone } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const TABLE_HEADERS = [
  { label: 'Data', className: 'w-40' },
  { label: 'Descrição', className: '' },
  { label: 'Categoria', className: 'w-40' },
  { label: 'Valor', className: 'w-32 text-right' },
  { label: 'Tipo', className: 'w-24 text-center' },
  { label: 'Fixo', className: 'w-20 text-center' },
  { label: 'Pago', className: 'w-24 text-center' },
  { label: 'Ações', className: 'w-32 text-center' },
];

export function FinanceiroGrid({ tone }: { tone?: BadgeTone }) {
  const {
    entries,
    filteredEntries,
    archivedPaidEntries,
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
      isPaid: false,
      isArchivedPaid: false,
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
        isPaid: data.isPaid ?? false,
        isArchivedPaid: false,
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

  const monthName =
    filters.month === 'all'
      ? 'Todos os meses'
      : new Date(2024, Number(filters.month) - 0)
          .toLocaleString('pt-BR', { month: 'long' })
          .replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="flex flex-col gap-6 flex-1 sm:min-h-0 sm:h-full sm:overflow-hidden w-full max-w-full min-w-0 overflow-hidden">
      <ProcessingOverlay isOpen={isProcessing || loading} />

      {/* VIEWPORT < 1280px: CARD GRID */}
      <div className="xl:hidden w-full max-w-full mx-auto px-3 space-y-6 overflow-x-hidden pb-10 min-w-0">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-0.5 pt-2">
            <h2 className="text-xs text-muted-foreground">Gestão financeira</h2>
            <h1 className="text-xl font-semibold tracking-tight">
              {monthName}{' '}
              <span className="text-(--tone-color)">{filters.year}</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-10 cursor-pointer flex-1 sm:flex-none"
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
                className="gap-2 h-10 cursor-pointer flex-1 sm:flex-none"
                disabled={isProcessing}
                onClick={() => setIsCategoriesOpen(true)}
              >
                <Tags size={14} />
                Categorias
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleOpenNew}
              disabled={isProcessing}
              className="h-10 gap-2 cursor-pointer sm:flex-1 md:max-w-xs"
            >
              <Plus size={16} />
              Novo lançamento
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Resumo operacional
          </h3>
          <FinanceiroStats tone={tone} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">
              Histórico de lançamentos
            </h3>
            <span className="text-xs text-muted-foreground">
              {filteredEntries.length} itens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch w-full max-w-full min-w-0">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32 rounded-full" />
                      <Skeleton className="h-4 w-48 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-xl" />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </div>
              ))
            ) : filteredEntries.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center space-y-1 rounded-2xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Vazio por aqui.</p>
                <p className="text-xs text-muted-foreground/70">
                  Nenhuma transação encontrada.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <FinanceiroMobileCard
                  key={entry.id}
                  entry={entry}
                  categories={categories}
                  formatCurrency={formatCurrency}
                  onToggleFixed={(entryId, isFixed) => {
                    if (entry.parentId) return;

                    if (!isFixed) {
                      setRecurringTarget(entry);
                      setIsRecurringModalOpen(true);
                    } else {
                      updateEntry(entryId, { isFixed: false });
                    }
                  }}
                  onTogglePaid={(entryId, isPaid) =>
                    updateEntry(entryId, { isPaid })
                  }
                  onStartEdit={() => handleOpenEdit(entry)}
                  onDelete={() =>
                    handleConfirmDelete(
                      [entry.id],
                      entry.isFixed || Boolean(entry.parentId),
                    )
                  }
                />
              ))
            )}
          </div>
        </div>

        {archivedPaidEntries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">
                Lançamentos pagos
              </h3>
              <span className="text-xs text-muted-foreground">
                {archivedPaidEntries.length} itens
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch w-full max-w-full min-w-0">
              {archivedPaidEntries.map((entry) => (
                <FinanceiroMobileCard
                  key={entry.id}
                  entry={entry}
                  categories={categories}
                  formatCurrency={formatCurrency}
                  onToggleFixed={() => undefined}
                  onTogglePaid={() => undefined}
                  onStartEdit={() => undefined}
                  onDelete={() => undefined}
                  isReadOnly
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEWPORT >= 1280px: DESKTOP TABLE */}
      <div className="hidden xl:flex flex-col gap-5 flex-1 sm:min-h-0 sm:h-full sm:overflow-hidden w-full min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-foreground">
            Movimentações financeiras — {monthName}
          </h2>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'hidden sm:flex gap-2 cursor-pointer',
                isSelectionMode && 'bg-primary/10 border-primary text-primary',
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
              className="gap-2 cursor-pointer flex-1 sm:flex-none"
              disabled={isProcessing}
              onClick={() => setIsCategoriesOpen(true)}
            >
              <Tags size={14} />
              Categorias
            </Button>

            <Button
              size="sm"
              onClick={handleOpenNew}
              disabled={isProcessing}
              className="basis-full sm:basis-auto w-full sm:w-auto gap-2 cursor-pointer"
            >
              <Plus size={14} />
              Novo lançamento
            </Button>
          </div>
        </div>

        <FinanceiroStats tone={tone} />

        <div className="flex-1 sm:h-full sm:overflow-auto sm:min-h-0 w-full min-w-0 overflow-hidden">
          <div className="hidden sm:block h-full min-h-0 rounded-2xl border border-border overflow-auto custom-scrollbar overscroll-contain">
            <Table className="min-w-230">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {TABLE_HEADERS.map((h) => (
                    <TableHead
                      key={h.label}
                      className={cn('text-xs text-muted-foreground', h.className)}
                    >
                      {h.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-8 w-24 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredEntries.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Nenhuma transação encontrada para este período.
                    </TableCell>
                  </TableRow>
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
                        if (entry.parentId) return;

                        if (!isFixed) {
                          setRecurringTarget(entry);
                          setIsRecurringModalOpen(true);
                        } else {
                          updateEntry(entryId, { isFixed: false });
                        }
                      }}
                      onTogglePaid={(entryId, isPaid) =>
                        updateEntry(entryId, { isPaid })
                      }
                      onStartEdit={() => handleOpenEdit(entry)}
                      onDelete={() =>
                        handleConfirmDelete(
                          [entry.id],
                          entry.isFixed || Boolean(entry.parentId),
                        )
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {archivedPaidEntries.length > 0 && (
          <div className="shrink-0 max-h-72 overflow-auto rounded-2xl border border-border custom-scrollbar">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Lançamentos pagos
              </h3>
              <span className="text-xs text-muted-foreground">
                {archivedPaidEntries.length} itens
              </span>
            </div>
            <Table className="min-w-230">
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  {TABLE_HEADERS.map((h) => (
                    <TableHead
                      key={h.label}
                      className={cn('text-xs text-muted-foreground', h.className)}
                    >
                      {h.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedPaidEntries.map((entry) => (
                  <FinanceiroGridRow
                    key={entry.id}
                    entry={entry}
                    categories={categories}
                    formatCurrency={formatCurrency}
                    onQuickCategoryChange={() => undefined}
                    onToggleFixed={() => undefined}
                    onTogglePaid={() => undefined}
                    onStartEdit={() => undefined}
                    onDelete={() => undefined}
                    isReadOnly
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {editingEntry !== null && (
        <FinanceiroEntryModal
          entry={editingEntry}
          categories={categories}
          onSave={(data, inst) => void handleSave(data, inst)}
          onClose={() => setEditingEntry(null)}
        />
      )}

      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <FinanceiroFilters
            tone={tone}
            filters={pendingFilters}
            setFilters={setPendingFilters}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setIsFiltersOpen(false)}
            >
              Voltar
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setFilters(pendingFilters);
                setIsFiltersOpen(false);
              }}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Categorias</DialogTitle>
          </DialogHeader>
          <FinanceiroCategories
            tone={tone}
            onApplyAction={() => setIsCategoriesOpen(false)}
            onCancelAction={() => setIsCategoriesOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
        <div className="fixed bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold tabular-nums bg-primary/10 text-primary">
                {selectedIds.size}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Selecionados
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs cursor-pointer"
                onClick={() => setSelectedIds(new Set())}
              >
                Limpar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-4 text-xs cursor-pointer"
                onClick={() => {
                  const ids = Array.from(selectedIds);
                  const hasParent = entries
                    .filter((e) => ids.includes(e.id))
                    .some((e) => e.isFixed || Boolean(e.parentId));
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
