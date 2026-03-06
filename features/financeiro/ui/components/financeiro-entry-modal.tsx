'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface FinanceiroEntryModalProps {
  entry: Partial<FinancialEntry> | null;
  categories: Category[];
  onSave: (data: Partial<FinancialEntry>) => void;
  onClose: () => void;
}

const formatCurrencyDisplay = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const parseCurrencyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
};

export function FinanceiroEntryModal({
  entry,
  categories,
  onSave,
  onClose,
}: FinanceiroEntryModalProps) {
  const [form, setForm] = useState<Partial<FinancialEntry>>({});
  const [amountInput, setAmountInput] = useState('');

  useEffect(() => {
    if (entry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(entry);
      setAmountInput(formatCurrencyDisplay(entry.amount ?? 0));
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = () => {
    onSave(form);
  };

  const handleAmountChange = (raw: string) => {
    const numeric = parseCurrencyInput(raw);
    setForm((prev) => ({ ...prev, amount: numeric }));
    setAmountInput(formatCurrencyDisplay(numeric));
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/30">
            <h3 className="text-sm font-bold text-foreground">
              {form.id ? 'Editar lançamento' : 'Novo lançamento'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="px-5 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-9 text-sm cursor-pointer',
                      !form.date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date
                      ? format(
                          new Date(`${form.date}T12:00:00`),
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: ptBR },
                        )
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      form.date ? new Date(`${form.date}T12:00:00`) : undefined
                    }
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        date: date ? format(date, 'yyyy-MM-dd') : '',
                      }))
                    }
                    initialFocus
                    locale={ptBR}
                    className="cursor-pointer"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Descrição
              </Label>
              <Input
                placeholder="Ex: Aluguel, Salário..."
                className="h-9 text-sm bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color)"
                value={form.description ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categoria
              </Label>
              <Select
                value={String(form.categoryId ?? '')}
                onValueChange={(categoryId) =>
                  setForm((prev) => ({ ...prev, categoryId }))
                }
              >
                <SelectTrigger className="h-9 text-sm bg-background border-border/40 cursor-pointer w-full">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="cursor-pointer text-sm"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  className="h-9 text-sm bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color) tabular-nums text-right"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tipo
                </Label>
                <div className="flex gap-2 h-9 items-center">
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer border',
                      form.type === 'receita'
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : 'text-muted-foreground border-border/40 hover:border-emerald-500/30 hover:text-emerald-500',
                    )}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: 'receita' }))
                    }
                  >
                    <TrendingUp size={13} />
                    Receita
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-all cursor-pointer border',
                      form.type === 'despesa'
                        ? 'bg-red-500/15 text-red-500 border-red-500/30'
                        : 'text-muted-foreground border-border/40 hover:border-red-500/30 hover:text-red-500',
                    )}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: 'despesa' }))
                    }
                  >
                    <TrendingDown size={13} />
                    Despesa
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Lançamento fixo</p>
                <p className="text-xs text-muted-foreground">
                  Recorrente todo mês
                </p>
              </div>
              <button
                type="button"
                className={cn(
                  'relative h-6 w-11 rounded-full transition-all duration-200 cursor-pointer border-2',
                  form.isFixed
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-muted border-border',
                )}
                onClick={() =>
                  setForm((prev) => ({ ...prev, isFixed: !prev.isFixed }))
                }
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
                    form.isFixed ? 'left-5' : 'left-0.5',
                  )}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
