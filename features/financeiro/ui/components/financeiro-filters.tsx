'use client';

import { Dispatch, SetStateAction } from 'react';
import {
  FiltersType,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BadgeTone } from '@/components/ui/badge';

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const years = Array.from({ length: 10 }, (_, i) =>
  (new Date().getFullYear() - 5 + i).toString(),
);

const paymentStatusLabels: Record<FiltersType['paymentStatus'], string> = {
  all: 'Todos',
  paid: 'Pagos',
  unpaid: 'Não pagos',
};

type FinanceiroFiltersProps = {
  tone?: BadgeTone;
  filters: FiltersType;
  setFilters: Dispatch<SetStateAction<FiltersType>>;
};

export function FinanceiroFilters({
  tone = 'success',
  filters,
  setFilters,
}: FinanceiroFiltersProps) {
  const { categories } = useFinanceiroContext();

  return (
    <div data-tone={tone} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground pl-1">
            Mês
          </label>
          <Select
            value={filters.month}
            onValueChange={(v) =>
              setFilters((prev: FiltersType) => ({ ...prev, month: v }))
            }
          >
            <SelectTrigger className="w-full bg-background cursor-pointer">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer font-bold">
                Todos
              </SelectItem>
              {months.map((m, i) => (
                <SelectItem
                  key={m}
                  value={i.toString()}
                  className="cursor-pointer"
                >
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground pl-1">
            Ano
          </label>
          <Select
            value={filters.year}
            onValueChange={(v) =>
              setFilters((prev: FiltersType) => ({ ...prev, year: v }))
            }
          >
            <SelectTrigger className="w-full bg-background cursor-pointer">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y} className="cursor-pointer">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground pl-1">
            Categoria
          </label>
          <Select
            value={filters.categoryId}
            onValueChange={(v) =>
              setFilters((prev: FiltersType) => ({
                ...prev,
                categoryId: v,
              }))
            }
          >
            <SelectTrigger className="w-full bg-background cursor-pointer">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer font-bold">
                Todas Categorias
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="cursor-pointer"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground pl-1">
            Tipo
          </label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(v) =>
              setFilters((prev: FiltersType) => ({ ...prev, type: v }))
            }
          >
            <SelectTrigger className="w-full bg-background cursor-pointer">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer font-bold">
                Todos
              </SelectItem>
              <SelectItem value="receita" className="cursor-pointer">
                Receita
              </SelectItem>
              <SelectItem value="despesa" className="cursor-pointer">
                Despesa
              </SelectItem>
              <SelectItem value="investimento" className="cursor-pointer">
                Investimento
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground pl-1">
            Pagamento
          </label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(v: FiltersType['paymentStatus']) =>
              setFilters((prev: FiltersType) => ({
                ...prev,
                paymentStatus: v,
              }))
            }
          >
            <SelectTrigger className="w-full bg-background cursor-pointer">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer font-bold">
                Todos
              </SelectItem>
              <SelectItem value="paid" className="cursor-pointer">
                Pagos
              </SelectItem>
              <SelectItem value="unpaid" className="cursor-pointer">
                Não pagos
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Filtrando por{' '}
          <span className="font-medium text-foreground">
            {filters.month === 'all'
              ? 'Todos os meses'
              : months[Number(filters.month)]}{' '}
            / {filters.year} / {paymentStatusLabels[filters.paymentStatus]}
          </span>
        </p>
      </div>
    </div>
  );
}
