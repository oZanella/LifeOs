'use client';

import { useState } from 'react';
import { Filter, Plus, Tags, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeTone } from '@/components/ui/badge';
import {
  FinancialEntry,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroCategories } from './financeiro-categories';
import { FinanceiroGridRow } from './financeiro-grid-row';
import { FinanceiroFilters } from './financeiro-filters';

export function FinanceiroGrid({ tone }: { tone?: BadgeTone }) {
  const {
    filteredEntries,
    categories,
    filters,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useFinanceiroContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FinancialEntry>>({});
  const [amountInput, setAmountInput] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const parseCurrencyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    return digits ? Number(digits) / 100 : 0;
  };

  const handleStartEdit = (entry: FinancialEntry) => {
    setEditingId(entry.id);
    setEditForm(entry);
    setAmountInput(formatCurrency(entry.amount));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setAmountInput('');
  };

  const handleSaveEdit = () => {
    if (!editingId) {
      return;
    }

    updateEntry(editingId, editForm);
    handleCancelEdit();
  };

  const handleAddDefault = async () => {
    const today = new Date();
    const year = filters.year || today.getFullYear().toString();
    const month =
      (Number(filters.month) + 1).toString().padStart(2, '0') ||
      (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const createdEntryId = await addEntry({
      date: `${year}-${month}-${day}`,
      description: 'Nova entrada',
      categoryId: categories[0]?.id || '',
      amount: 0,
      type: 'despesa',
      isFixed: false,
    });

    if (createdEntryId) {
      setEditingId(createdEntryId);
      setEditForm({
        id: createdEntryId,
        date: `${year}-${month}-${day}`,
        description: 'Nova entrada',
        categoryId: categories[0]?.id || '',
        amount: 0,
        type: 'despesa',
        isFixed: false,
      });
      setAmountInput(formatCurrency(0));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap cursor-default">
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
            Fluxo de Caixa
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer flex-1 sm:flex-none"
            onClick={() => setIsFiltersOpen(true)}
          >
            <Filter size={14} />
            Filtros
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer flex-1 sm:flex-none"
            onClick={() => setIsCategoriesOpen(true)}
          >
            <Tags size={14} />
            Categorias
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleAddDefault()}
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

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden overflow-x-auto custom-scrollbar min-h-65">
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
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground italic text-sm"
                >
                  Carregando transacoes...
                </td>
              </tr>
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
                  categories={categories}
                  isEditing={editingId === entry.id}
                  editForm={editForm}
                  amountInput={amountInput}
                  formatCurrency={formatCurrency}
                  parseCurrencyInput={parseCurrencyInput}
                  onChangeForm={setEditForm}
                  onAmountInputChange={setAmountInput}
                  onQuickCategoryChange={(entryId, categoryId) =>
                    updateEntry(entryId, { categoryId })
                  }
                  onToggleFixed={(entryId, isFixed) =>
                    updateEntry(entryId, { isFixed: !isFixed })
                  }
                  onStartEdit={() => handleStartEdit(entry)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onDelete={() => deleteEntry(entry.id)}
                  autoFocusDescription={editingId === entry.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setIsFiltersOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              <FinanceiroFilters tone={tone} />
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
            <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-background p-0 shadow-2xl">
              <div className="flex items-center justify-between px-3 pt-3">
                <h3 className="text-sm font-bold text-foreground">
                  Categorias
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setIsCategoriesOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="px-3 pb-3">
                <FinanceiroCategories
                  tone={tone}
                  className="mb-0 border-0 shadow-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
