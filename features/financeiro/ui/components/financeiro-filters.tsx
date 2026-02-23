'use client';

import {
  useFinanceiroContext,
  Category,
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

export function FinanceiroFilters({ tone = 'success' }: { tone?: BadgeTone }) {
  const { filters, setFilters, categories } = useFinanceiroContext();

  console.log('Filters Tone:', tone);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 bg-muted/30 p-4 rounded-xl border border-border/40">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Mês
        </label>
        <Select
          value={filters.month}
          onValueChange={(v) =>
            setFilters(
              (prev: {
                day: string;
                month: string;
                year: string;
                categoryId: string;
              }) => ({ ...prev, month: v }),
            )
          }
        >
          <SelectTrigger className="w-40 bg-background cursor-pointer">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
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
            setFilters(
              (prev: {
                day: string;
                month: string;
                year: string;
                categoryId: string;
              }) => ({ ...prev, year: v }),
            )
          }
        >
          <SelectTrigger className="w-30 bg-background cursor-pointer">
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
            setFilters(
              (prev: {
                day: string;
                month: string;
                year: string;
                categoryId: string;
              }) => ({ ...prev, categoryId: v }),
            )
          }
        >
          <SelectTrigger className="w-44 bg-background cursor-pointer">
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

      <div className="flex-1" />

      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Filtrando por:{' '}
        <span style={{ color: 'var(--tone-color)' }}>
          {months[Number(filters.month)]} / {filters.year}
        </span>
      </div>
    </div>
  );
}
