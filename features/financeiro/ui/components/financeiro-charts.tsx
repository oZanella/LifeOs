'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
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
          <span className="font-bold">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

function buildDailyData(entries: FinancialEntry[]) {
  const map = new Map<
    string,
    {
      label: string;
      receita: number;
      despesa: number;
      investimento: number;
      saldo: number;
    }
  >();

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sorted) {
    const key = entry.date;

    if (!map.has(key)) {
      const [, month, day] = key.split('-');

      map.set(key, {
        label: `${day}/${month}`,
        receita: 0,
        despesa: 0,
        investimento: 0,
        saldo: 0,
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

  let accumulated = 0;

  return Array.from(map.values()).map((row) => {
    accumulated += row.receita + row.investimento - row.despesa;

    return { ...row, saldo: accumulated };
  });
}

export function FinanceiroCharts() {
  const { filteredEntries } = useFinanceiroContext();

  const dailyData = useMemo(
    () => buildDailyData(filteredEntries),
    [filteredEntries],
  );

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

  if (dailyData.length === 0) return null;

  const axisStyle = {
    fontSize: 10,
    fill: colorsEdit.text,
    fontFamily: 'inherit',
    textAnchor: 'middle' as const,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
          Evolução do saldo
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colorsEdit.revenue}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={colorsEdit.revenue}
                  stopOpacity={0}
                />
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
              padding={{ left: 40, right: 20 }}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatBRLShort}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke={colorsEdit.revenue}
              strokeWidth={2}
              fill="url(#saldoGrad)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 flex flex-col items-center">
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
