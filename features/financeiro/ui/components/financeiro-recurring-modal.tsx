'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const handleConfirm = () => {
    const num = parseInt(months, 10);
    if (!isNaN(num) && num > 0) {
      onConfirm(num);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lançamento fixo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-foreground">
            Deseja replicar o lançamento{' '}
            <span className="font-medium">&quot;{description}&quot;</span>{' '}
            para os próximos meses?
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="months" className="text-xs font-medium text-muted-foreground">
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
              className="h-10 text-sm"
            />
            <p className="px-1 text-xs text-muted-foreground">
              O sistema criará lançamentos automáticos mantendo o mesmo dia
              para cada mês subsequente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Apenas este mês
          </Button>
          <Button
            className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
