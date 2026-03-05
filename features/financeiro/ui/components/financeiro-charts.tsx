'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  FinancialEntry,
  useFinanceiroContext,
} from '@/features/financeiro/application/context/financeiro-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
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
    { label: string; receita: number; despesa: number; saldo: number }
  >();

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sorted) {
    const d = new Date(`${entry.date}T12:00:00`);
    const key = entry.date;
    const label = format(d, 'dd/MM', { locale: ptBR });
    if (!map.has(key))
      map.set(key, { label, receita: 0, despesa: 0, saldo: 0 });
    const row = map.get(key)!;
    if (entry.type === 'receita') row.receita += entry.amount;
    else row.despesa += entry.amount;
  }

  let accumulated = 0;
  return Array.from(map.values()).map((row) => {
    accumulated += row.receita - row.despesa;
    return { ...row, saldo: accumulated };
  });
}

export function FinanceiroCharts() {
  const { filteredEntries } = useFinanceiroContext();

  const dailyData = useMemo(
    () => buildDailyData(filteredEntries),
    [filteredEntries],
  );

  if (dailyData.length === 0) return null;

  const axisStyle = {
    fontSize: 10,
    fill: colorsEdit.text,
    fontFamily: 'inherit',
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
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
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
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
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

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
          Receitas vs Despesas
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={dailyData}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            barGap={2}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colorsEdit.grid}
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatBRLShort}
              width={52}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="receita"
              name="Receita"
              fill={colorsEdit.revenue}
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="despesa"
              name="Despesa"
              fill={colorsEdit.expense}
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
