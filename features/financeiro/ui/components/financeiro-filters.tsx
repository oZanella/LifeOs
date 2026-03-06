'use client';

import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
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

  return (
    <div
      data-tone={tone}
      className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 bg-muted/30 p-3 sm:p-4 rounded-xl border border-border/40"
    >
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Mês
        </label>
        <Select
          value={filters.month}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, month: v }))}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background cursor-pointer">
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

      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Ano
        </label>
        <Select
          value={filters.year}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, year: v }))}
        >
          <SelectTrigger className="w-full sm:w-28 bg-background cursor-pointer">
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

      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Categoria
        </label>
        <Select
          value={filters.categoryId}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, categoryId: v }))
          }
        >
          <SelectTrigger className="w-full sm:w-44 bg-background cursor-pointer">
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

      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Tipo
        </label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, type: v }))}
        >
          <SelectTrigger className="w-full sm:w-32 bg-background cursor-pointer">
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
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block flex-1" />

      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest sm:text-right">
        Filtrando por:{' '}
        <span style={{ color: 'var(--tone-color)' }}>
          {months[Number(filters.month)]} / {filters.year}
        </span>
      </div>
    </div>
  );
}
