'use client';

import { useMemo, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  ComposedChart,
  Area,
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
  hideValues,
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
  hideValues?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  const shown = payload.filter((p) => p.name);
  if (!shown.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-muted-foreground mb-1">
        {label || shown[0].name}
      </p>
      {shown.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color || p.fill }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span
            className={cn(
              'font-semibold',
              p.name === 'Receita' && 'text-emerald-600 dark:text-emerald-400',
              p.name === 'Despesa' && 'text-red-600 dark:text-red-400',
              p.name === 'Investimento' && 'text-blue-600 dark:text-blue-400',
            )}
          >
            {hideValues ? '••••••' : formatBRL(p.value)}
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

export function FinanceiroCharts({
  hideValues = false,
}: {
  hideValues?: boolean;
}) {
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Skeleton className="h-3 w-48 mb-4" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col items-center">
          <Skeleton className="h-3 w-40 mb-4 self-start" />
          <div className="flex items-center justify-center w-full">
            <Skeleton className="h-56 w-56 rounded-full" />
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
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">
            Gráficos financeiros
          </h3>
          <p className="text-xs text-muted-foreground">
            Resumo mensal das movimentações
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart3 size={28} className="text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma informação disponível para exibir os gráficos ainda.
          </p>
        </div>
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
      <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-foreground">
            Evolução financeira ({new Date().getFullYear()})
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
        <div className="flex-1 min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activeGroupData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorsEdit.revenue} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colorsEdit.revenue} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v: number) => (hideValues ? '••••' : formatBRLShort(v))}
              width={52}
            />
            <Tooltip content={<CustomTooltip hideValues={hideValues} />} />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="none"
              fill="url(#fillReceita)"
              legendType="none"
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke={colorsEdit.revenue}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: colorsEdit.revenue, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="despesa"
              name="Despesa"
              stroke={colorsEdit.expense}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: colorsEdit.expense, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="investimento"
              name="Investimento"
              stroke={colorsEdit.investment}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: colorsEdit.investment, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col items-center">
        <p className="text-sm font-medium text-foreground mb-4 w-full">
          Receitas vs despesas
        </p>
        <div className="relative w-full flex-1 min-h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip content={<CustomTooltip hideValues={hideValues} />} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground leading-none">
              Saldo
            </span>
            <span className="text-2xl font-semibold tabular-nums text-foreground mt-1">
              {hideValues
                ? '••••••'
                : formatBRL(
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
                <span className="text-xs text-muted-foreground leading-tight">
                  {item.name}
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {hideValues ? '••••' : formatBRLShort(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
