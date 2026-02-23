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
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinanceiroGrid({}: { tone?: BadgeTone }) {
  const {
    filteredEntries,
    categories,
    filters,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useFinanceiroContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FinancialEntry>>({});

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
    // Use filters month/year if selected, otherwise today
    const y = filters.year || today.getFullYear().toString();
    const m =
      (Number(filters.month) + 1).toString().padStart(2, '0') ||
      (today.getMonth() + 1).toString().padStart(2, '0');
    const d = today.getDate().toString().padStart(2, '0');

    addEntry({
      date: `${y}-${m}-${d}`,
      description: 'Nova entrada',
      categoryId: categories[0]?.id || '',
      amount: 0,
      type: 'despesa',
      isFixed: false,
    });
  };

  const CategoryCell = ({ entry }: { entry: FinancialEntry }) => {
    const cat = categories.find((c) => c.id === entry.categoryId);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-opacity hover:opacity-80">
            {cat ? (
              <Badge
                tone={cat.tone as BadgeTone}
                variant="subtle"
                className="text-[10px] uppercase font-bold tracking-tight border-none"
              >
                {cat.name}
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
            {categories.map((c) => (
              <button
                key={String(c.id)}
                onClick={() => updateEntry(entry.id, { categoryId: c.id })}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer',
                  entry.categoryId === c.id
                    ? 'bg-muted font-bold'
                    : 'hover:bg-muted/50',
                )}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `var(--tone-${c.tone})` }}
                />
                {c.name}
                {entry.categoryId === c.id && (
                  <Check size={12} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
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
                                format(
                                  new Date(editForm.date + 'T12:00:00'),
                                  'dd/MM/yyyy',
                                )
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
                                  ? new Date(editForm.date + 'T12:00:00')
                                  : undefined
                              }
                              onSelect={(date) =>
                                setEditForm({
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
                          {format(
                            new Date(entry.date + 'T12:00:00'),
                            'dd/MM/yyyy',
                          )}
                        </span>
                      )}
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <Input
                          className="h-8 text-xs bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color)"
                          value={editForm.description || ''}
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
                        <Select
                          value={String(editForm.categoryId || '')}
                          onValueChange={(v) =>
                            setEditForm({
                              ...editForm,
                              categoryId: v,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-full text-xs bg-background border-border/40 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem
                                key={String(cat.id)}
                                value={String(cat.id)}
                                className="cursor-pointer text-xs"
                              >
                                {String(cat.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <CategoryCell entry={entry} />
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color) tabular-nums"
                          value={editForm.amount || 0}
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
                              'p-1 rounded cursor-pointer',
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
                              'p-1 rounded cursor-pointer',
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
                          className="accent-(--tone-color) cursor-pointer"
                          checked={editForm.isFixed}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              isFixed: e.target.checked,
                            })
                          }
                        />
                      ) : (
                        <div
                          className="flex justify-center cursor-pointer"
                          onClick={() =>
                            updateEntry(entry.id, { isFixed: !entry.isFixed })
                          }
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

                    {/* Ações */}
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                              onClick={handleSaveEdit}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 hover:bg-red-500/10 cursor-pointer"
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
                              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => handleStartEdit(entry)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer"
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
