'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FinanceiroRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (months: number) => void;
  description: string;
}

export function FinanceiroRecurringModal({
  isOpen,
  onClose,
  onConfirm,
  description,
}: FinanceiroRecurringModalProps) {
  const [months, setMonths] = useState<string>('3');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const num = parseInt(months, 10);
    if (!isNaN(num) && num > 0) {
      onConfirm(num);
      onClose();
    }
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
              Lançamento Fixo
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

          <div className="px-5 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground">
                Deseja replicar o lançamento{' '}
                <span className="font-bold italic">
                  &quot;{description}&quot;
                </span>{' '}
                para os próximos meses?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="months"
                className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1"
              >
                Número de meses adicionais
              </Label>
              <Input
                id="months"
                type="text"
                inputMode="numeric"
                value={months}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMonths(value);
                }}
                className="h-10 text-sm bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-amber-500"
              />
              <p className="text-[10px] text-muted-foreground italic leading-tight px-1">
                O sistema criará lançamentos automáticos mantendo o mesmo dia
                para cada mês subsequente.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 pb-5 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="px-4 cursor-pointer text-muted-foreground hover:text-foreground h-9"
              onClick={onClose}
            >
              Apenas este mês
            </Button>
            <Button
              size="sm"
              className="px-6 cursor-pointer font-bold bg-amber-500 hover:bg-amber-600 text-white h-9 shadow-lg shadow-amber-500/20"
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
