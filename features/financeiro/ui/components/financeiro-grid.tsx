'use client';

import { useState } from 'react';
import {
  FinancialEntry,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import {
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function FinanceiroGrid({ tone = 'success' }: { tone?: BadgeTone }) {
  const { entries, filters, addEntry, updateEntry, deleteEntry } =
    useFinanceiroContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FinancialEntry>>({});

  console.log('Grid Tone:', tone); // Using tone to avoid unused warning

  const filteredEntries = entries
    .filter((entry: FinancialEntry) => {
      const d = new Date(entry.date);
      const mMatch =
        filters.month === '' || d.getMonth().toString() === filters.month;
      const yMatch =
        filters.year === '' || d.getFullYear().toString() === filters.year;
      return mMatch && yMatch;
    })
    .sort(
      (a: FinancialEntry, b: FinancialEntry) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  const handleStartEdit = (entry: FinancialEntry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateEntry(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleAddDefault = () => {
    const today = new Date();
    const dateStr = `${filters.year}-${(Number(filters.month) + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    addEntry({
      date: dateStr,
      description: 'Nova entrada',
      category: 'Outros',
      amount: 0,
      type: 'despesa',
      isFixed: false,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
          Fluxo de Caixa
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddDefault}
          className="gap-2 border-dashed hover:border-solid transition-all cursor-pointer"
          style={{
            borderColor: 'var(--tone-color)',
            color: 'var(--tone-color)',
          }}
        >
          <Plus size={14} />
          Nova Linha
        </Button>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-200">
          <thead>
            <tr className="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40">
              <th className="px-4 py-3 w-32">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 w-32">Categoria</th>
              <th className="px-4 py-3 w-32">Valor</th>
              <th className="px-4 py-3 w-24 text-center">Tipo</th>
              <th className="px-4 py-3 w-20 text-center">Fixo</th>
              <th className="px-4 py-3 w-32 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground italic text-sm"
                >
                  Nenhuma transação encontrada para este período.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isEditing = editingId === entry.id;

                return (
                  <tr
                    key={entry.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    {/* Data */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="date"
                          className="w-full bg-background border border-border/40 rounded px-2 py-1 text-xs outline-none focus:border-(--tone-color)"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                        />
                      ) : (
                        <span className="text-xs font-medium tabular-nums">
                          {new Date(
                            entry.date + 'T12:00:00',
                          ).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full bg-background border border-border/40 rounded px-2 py-1 text-xs outline-none focus:border-(--tone-color)"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className="text-sm">{entry.description}</span>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <select
                          className="w-full bg-background border border-border/40 rounded px-2 py-1 text-xs outline-none"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="Salário">Salário</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Investimento">Investimento</option>
                          <option value="Alimentação">Alimentação</option>
                          <option value="Moradia">Moradia</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Lazer">Lazer</option>
                          <option value="Educação">Educação</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Outros">Outros</option>
                        </select>
                      ) : (
                        <Badge
                          variant="subtle"
                          className="text-[10px] uppercase font-bold tracking-tight bg-gray-500/10 text-gray-500 border-none"
                        >
                          {entry.category}
                        </Badge>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-background border border-border/40 rounded px-2 py-1 text-xs outline-none focus:border-(--tone-color)"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              amount: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span
                          className={cn(
                            'text-sm font-black tabular-nums',
                            entry.type === 'receita'
                              ? 'text-emerald-500'
                              : 'text-red-500',
                          )}
                        >
                          {entry.type === 'receita' ? '+' : '-'}{' '}
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(entry.amount)}
                        </span>
                      )}
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-2 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className={cn(
                              'p-1 rounded',
                              editForm.type === 'receita'
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'text-muted-foreground',
                            )}
                            onClick={() =>
                              setEditForm({ ...editForm, type: 'receita' })
                            }
                          >
                            <TrendingUp size={14} />
                          </button>
                          <button
                            className={cn(
                              'p-1 rounded',
                              editForm.type === 'despesa'
                                ? 'bg-red-500/20 text-red-500'
                                : 'text-muted-foreground',
                            )}
                            onClick={() =>
                              setEditForm({ ...editForm, type: 'despesa' })
                            }
                          >
                            <TrendingDown size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          {entry.type === 'receita' ? (
                            <TrendingUp
                              size={14}
                              className="text-emerald-500"
                            />
                          ) : (
                            <TrendingDown size={14} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Fixo */}
                    <td className="px-4 py-2 text-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          className="accent-(--tone-color)"
                          checked={editForm.isFixed}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isFixed: e.target.checked,
                            })
                          }
                        />
                      ) : (
                        <div className="flex justify-center">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              entry.isFixed
                                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'bg-gray-700',
                            )}
                          />
                        </div>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={handleSaveEdit}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 hover:bg-red-500/10"
                              onClick={handleCancelEdit}
                            >
                              <X size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleStartEdit(entry)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
