'use client';

import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v);

interface StatsData {
  balance: number;
  totalRevenue: number;
  totalExpense: number;
  fixedExpenses: number;
  forecast: number;
}

function MobileStats({ stats, tone }: { stats: StatsData; tone: BadgeTone }) {
  const balancePositive = stats.balance >= 0;

  return (
    <div className="flex sm:hidden flex-col gap-3" data-tone={tone}>
      <div
        className={cn(
          'rounded-2xl border px-5 py-4 flex items-center justify-between',
          balancePositive
            ? 'bg-emerald-500/10 border-emerald-500/25'
            : 'bg-red-500/10 border-red-500/25',
        )}
      >
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            Saldo Atual
          </p>
          <p
            className={cn(
              'text-2xl font-black tabular-nums tracking-tight',
              balancePositive ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {formatCurrency(stats.balance)}
          </p>
        </div>
        <div
          className={cn(
            'h-11 w-11 rounded-xl flex items-center justify-center',
            balancePositive ? 'bg-emerald-500/20' : 'bg-red-500/20',
          )}
        >
          <Wallet
            size={20}
            className={balancePositive ? 'text-emerald-500' : 'text-red-500'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            title: 'Receitas',
            value: stats.totalRevenue,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            title: 'Despesas',
            value: stats.totalExpense,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            title: 'Gastos Fixos',
            value: stats.fixedExpenses,
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            title: 'Previsão',
            value: stats.forecast,
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 flex items-center gap-3"
          >
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                item.bg,
              )}
            >
              <item.icon size={15} className={item.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {item.title}
              </p>
              <p className={cn('text-sm font-black tabular-nums', item.color)}>
                {formatCurrency(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopStats({ stats, tone }: { stats: StatsData; tone: BadgeTone }) {
  const balancePositive = stats.balance >= 0;

  const items = [
    {
      title: 'Saldo Atual',
      value: stats.balance,
      icon: Wallet,
      color: balancePositive ? 'text-emerald-500' : 'text-red-500',
    },
    {
      title: 'Receitas',
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      title: 'Despesas',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'Gastos Fixos',
      value: stats.fixedExpenses,
      icon: AlertCircle,
      color: 'text-amber-500',
    },
    {
      title: 'Previsão (Forecast)',
      value: stats.forecast,
      icon: Calendar,
      color: 'text-blue-500',
    },
  ];

  return (
    <div
      data-tone={tone}
      className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {items.map((item) => (
        <Card
          key={item.title}
          className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-default">
                {item.title}
              </CardTitle>
              <item.icon size={14} className={item.color} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className={`text-lg font-black tracking-tight ${item.color}`}>
              {formatCurrency(item.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsSkeleton({}: { tone: BadgeTone }) {
  return (
    <>
      <div className="flex sm:hidden flex-col gap-3">
        <Skeleton className="h-21 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-15 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-23 w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}

export function FinanceiroStats({ tone = 'success' }: { tone?: BadgeTone }) {
  const { stats, loading } = useFinanceiroContext();

  if (loading) return <StatsSkeleton tone={tone} />;

  return (
    <>
      <MobileStats stats={stats} tone={tone} />
      <DesktopStats stats={stats} tone={tone} />
    </>
  );
}
