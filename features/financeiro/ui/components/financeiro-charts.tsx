'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  FinancialEntry,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

const formatBRLShort = (v: number) => {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${v.toFixed(0)}`;
};

const colorsEdit = {
  revenue: 'var(--receita)',
  expense: 'var(--despesa)',
  investment: 'var(--investimento)',
  grid: 'var(--border)',
  text: 'var(--muted-foreground)',
  background: 'var(--background)',
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
    payload?: unknown;
  }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-muted-foreground mb-1">
        {label || payload[0].name}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color || p.fill }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span
            className={cn(
              'font-bold',
              p.name === 'Receita' && 'text-emerald-500',
              p.name === 'Despesa' && 'text-red-500',
              p.name === 'Investimento' && 'text-blue-500',
            )}
          >
            {formatBRL(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

function buildMonthlyData(entries: FinancialEntry[]) {
  const map = new Map<
    string,
    {
      label: string;
      receita: number;
      despesa: number;
      investimento: number;
    }
  >();

  const getMonthName = (dateStr: string) => {
    const [, month] = dateStr.split('-');
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return months[parseInt(month) - 1];
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sorted) {
    const [year, month] = entry.date.split('-');
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, {
        label: getMonthName(entry.date),
        receita: 0,
        despesa: 0,
        investimento: 0,
      });
    }

    const row = map.get(key)!;

    switch (entry.type) {
      case 'receita':
        row.receita += entry.amount;
        break;

      case 'despesa':
        row.despesa += entry.amount;
        break;

      case 'investimento':
        row.investimento += entry.amount;
        break;
    }
  }

  return Array.from(map.values());
}

export function FinanceiroCharts() {
  const { entries, filteredEntries, loading } = useFinanceiroContext();
  const [isMobile, setIsMobile] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);

  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const yearEntries = entries.filter((e) => e.date.startsWith(currentYear));
    return buildMonthlyData(yearEntries);
  }, [entries]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const groupedData = useMemo(() => {
    const step = isMobile ? 3 : 6;
    const chunks: (typeof monthlyData)[] = [];
    for (let i = 0; i < monthlyData.length; i += step) {
      chunks.push(monthlyData.slice(i, i + step));
    }
    return chunks;
  }, [monthlyData, isMobile]);

  useEffect(() => {
    if (groupedData.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroupIndex((prev) =>
      Math.min(prev, Math.max(groupedData.length - 1, 0)),
    );
  }, [groupedData.length]);

  const pieData = useMemo(() => {
    const revenue = filteredEntries
      .filter((e) => e.type === 'receita')
      .reduce((acc, e) => acc + e.amount, 0);
    const expense = filteredEntries
      .filter((e) => e.type === 'despesa')
      .reduce((acc, e) => acc + e.amount, 0);
    const investment = filteredEntries
      .filter((e) => e.type === 'investimento')
      .reduce((acc, e) => acc + e.amount, 0);

    return [
      { name: 'Receita', value: revenue, color: colorsEdit.revenue },
      { name: 'Despesa', value: expense, color: colorsEdit.expense },
      {
        name: 'Investimento',
        value: investment,
        color: colorsEdit.investment,
      },
    ].filter((item) => item.value > 0);
  }, [filteredEntries]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-md backdrop-blur-sm dark:border-border/40 dark:bg-card/30 dark:shadow-none">
          <Skeleton className="h-3 w-48 mb-4" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-md backdrop-blur-sm dark:border-border/40 dark:bg-card/30 dark:shadow-none flex flex-col items-center">
          <Skeleton className="h-3 w-40 mb-4 self-start" />
          <div className="flex items-center justify-center w-full">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 w-full">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-md backdrop-blur-sm dark:border-border/40 dark:bg-card/30 dark:shadow-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
          Graficos
        </p>
        <p className="text-sm text-muted-foreground">
          Nenhuma informação disponível para exibir os gráficos ainda.
        </p>
      </div>
    );
  }

  const axisStyle = {
    fontSize: 10,
    fill: colorsEdit.text,
    fontFamily: 'inherit',
    textAnchor: 'middle' as const,
  };

  const totalGroups = Math.max(groupedData.length, 1);
  const activeGroupData = groupedData[groupIndex] ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-md backdrop-blur-sm dark:border-border/40 dark:bg-card/30 dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Evolução Financeira ({new Date().getFullYear()})
          </p>
          {totalGroups > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGroupIndex((prev) => Math.max(prev - 1, 0))}
                className="h-6 w-6 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                disabled={groupIndex === 0}
                aria-label={
                  isMobile
                    ? 'Mostrar 3 meses anteriores'
                    : 'Mostrar 6 meses anteriores'
                }
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGroupIndex((prev) => Math.min(prev + 1, totalGroups - 1))
                }
                className="h-6 w-6 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                disabled={groupIndex === totalGroups - 1}
                aria-label={
                  isMobile
                    ? 'Mostrar próximos 3 meses'
                    : 'Mostrar próximos 6 meses'
                }
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart
            data={activeGroupData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colorsEdit.grid}
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ ...axisStyle }}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={10}
              height={30}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatBRLShort}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke={colorsEdit.revenue}
              strokeWidth={3}
              dot={{ r: 4, fill: colorsEdit.revenue, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="despesa"
              name="Despesa"
              stroke={colorsEdit.expense}
              strokeWidth={3}
              dot={{ r: 4, fill: colorsEdit.expense, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="investimento"
              name="Investimento"
              stroke={colorsEdit.investment}
              strokeWidth={3}
              dot={{ r: 4, fill: colorsEdit.investment, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-md backdrop-blur-sm dark:border-border/40 dark:bg-card/30 dark:shadow-none flex flex-col items-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 w-full">
          Receitas vs Despesas
        </p>
        <div className="relative w-full h-45">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">
              Saldo
            </span>
            <span className="text-sm font-black text-foreground">
              {formatBRL(
                pieData.reduce(
                  (acc, item) =>
                    item.name === 'Receita'
                      ? acc + item.value
                      : acc - item.value,
                  0,
                ),
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 w-full">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">
                  {item.name}
                </span>
                <span className="text-xs font-black leading-tight">
                  {formatBRLShort(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
