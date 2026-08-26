'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceiroEntryModalProps {
  entry: Partial<FinancialEntry> | null;
  categories: Category[];
  onSave: (data: Partial<FinancialEntry>, installments?: number) => void;
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
  const { isProcessing } = useFinanceiroContext();
  const [form, setForm] = useState<Partial<FinancialEntry>>({});
  const [amountInput, setAmountInput] = useState('');
  const [installments, setInstallments] = useState('1');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (entry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(entry);
      setAmountInput(formatCurrencyDisplay(entry.amount ?? 0));
      setInstallments('1');
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = () => {
    onSave(form, parseInt(installments, 10));
  };

  const handleAmountChange = (raw: string) => {
    const numeric = parseCurrencyInput(raw);
    setForm((prev) => ({ ...prev, amount: numeric }));
    setAmountInput(formatCurrencyDisplay(numeric));
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {form.id ? 'Editar lançamento' : 'Novo lançamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Data
            </Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 w-full cursor-pointer justify-start text-left text-sm font-normal',
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
                  onSelect={(date) => {
                    setForm((prev) => ({
                      ...prev,
                      date: date ? format(date, 'yyyy-MM-dd') : '',
                    }));

                    if (date) {
                      setIsDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                  className="cursor-pointer"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Descrição
            </Label>
            <Input
              placeholder="Ex: Aluguel, Salário..."
              className="h-9 text-sm"
              value={form.description ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Categoria
              </Label>

              <Select
                value={String(form.categoryId ?? '')}
                onValueChange={(categoryId) =>
                  setForm((prev) => ({ ...prev, categoryId }))
                }
              >
                <SelectTrigger className="h-9 w-full cursor-pointer text-sm">
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

            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Valor
              </Label>

              <Input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                className="h-9 text-right text-sm tabular-nums"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Tipo
            </Label>
            <div className="flex h-9 items-center gap-2">
              <button
                type="button"
                className={cn(
                  'flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                  form.type === 'receita'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-600',
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
                  'flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                  form.type === 'investimento'
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-border text-muted-foreground hover:border-blue-500/30 hover:text-blue-600',
                )}
                onClick={() =>
                  setForm((prev) => ({ ...prev, type: 'investimento' }))
                }
              >
                <TrendingUp size={13} />
                Investimento
              </button>
              <button
                type="button"
                className={cn(
                  'flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                  form.type === 'despesa'
                    ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:border-red-500/30 hover:text-red-600',
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

          {!form.id && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Lançamento fixo</p>
                  <p className="text-xs text-muted-foreground">
                    Recorrente todo mês
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(
                    'relative h-6 w-11 cursor-pointer rounded-full border-2 transition-colors',
                    form.isFixed
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-border bg-muted',
                  )}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, isFixed: !prev.isFixed }))
                  }
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                      form.isFixed ? 'left-5' : 'left-0.5',
                    )}
                  />
                </button>
              </div>

              {form.isFixed && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Nº de parcelas (meses totais)
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 12"
                    className="h-9 text-sm"
                    value={installments}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setInstallments(val);
                    }}
                  />
                  <p className="px-1 text-xs text-muted-foreground">
                    O sistema criará automaticamente{' '}
                    {parseInt(installments || '1', 10) - 1} lançamentos para
                    os meses seguintes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" className="cursor-pointer" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="cursor-pointer"
            disabled={isProcessing}
            onClick={handleSave}
          >
            {isProcessing ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
