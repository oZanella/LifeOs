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
    <div
      data-tone={tone}
      className="flex flex-col gap-4 rounded-xl border border-border bg-muted/50 p-3 sm:p-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
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
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
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
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
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
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
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
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Filtrando por:{' '}
          <span style={{ color: 'var(--tone-color)' }}>
            {filters.month === 'all'
              ? 'Todos os Meses'
              : months[Number(filters.month)]}{' '}
            / {filters.year}
          </span>
        </div>
      </div>
    </div>
  );
}
