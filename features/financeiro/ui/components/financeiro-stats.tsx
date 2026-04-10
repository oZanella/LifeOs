'use client';

import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  CheckCircle2,
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
  totalInvestment: number;
  fixedExpenses: number;
  paidTotal: number;
}

function MobileStats({ stats, tone }: { stats: StatsData; tone: BadgeTone }) {
  const balancePositive = stats.balance >= 0;

  return (
    <div
      className="flex sm:hidden flex-col gap-4 w-full max-w-full overflow-hidden min-w-0"
      data-tone={tone}
    >
      {/* Principal: Saldo Atual */}
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border px-5 py-5 flex items-center justify-between shadow-lg transition-all w-full min-w-0',
          balancePositive
            ? 'bg-emerald-500/10 border-emerald-500/25 dark:bg-emerald-500/5'
            : 'bg-red-500/10 border-red-500/25 dark:bg-red-500/5',
        )}
      >
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${balancePositive ? 'var(--esmeralda)' : 'var(--vermelho)'} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-80 truncate">
            Saldo Disponível
          </p>
          <p
            className={cn(
              'text-2xl font-black tabular-nums tracking-tighter italic truncate',
              balancePositive ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {formatCurrency(stats.balance)}
          </p>
        </div>

        <div
          className={cn(
            'relative z-10 h-11 w-11 rounded-2xl flex items-center justify-center shadow-inner blur-[0.5px] shrink-0',
            balancePositive ? 'bg-emerald-500/20' : 'bg-red-500/20',
          )}
        >
          <Wallet
            size={22}
            className={balancePositive ? 'text-emerald-500' : 'text-red-500'}
          />
        </div>
      </div>

      {/* Grid de Stats Secundários */}
      <div className="grid grid-cols-2 gap-2.5 w-full min-w-0">
        {[
          {
            title: 'Receitas',
            value: stats.totalRevenue,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            tone: 'success',
          },
          {
            title: 'Despesas',
            value: stats.totalExpense,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            tone: 'error',
          },
          {
            title: 'Investido',
            value: stats.totalInvestment,
            icon: TrendingUp,
            color: 'text-blue-700',
            bg: 'bg-blue-700/10',
            tone: 'info',
          },
          {
            title: 'Pagos',
            value: stats.paidTotal,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-600/10',
            tone: 'success',
          },
          {
            title: 'Fixo',
            value: stats.fixedExpenses,
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            tone: 'warning',
          },
        ].map((item, idx) => (
          <div
            key={item.title}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/40 p-3 shadow-sm backdrop-blur-sm transition-all active:scale-[0.98] min-w-0',
              idx === 0 && 'col-span-1',
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <div
                className={cn(
                  'h-7 w-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                  item.bg,
                )}
              >
                <item.icon size={14} className={item.color} />
              </div>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none truncate opacity-80">
                {item.title}
              </p>
            </div>

            <p
              className={cn(
                'text-xs font-black tabular-nums tracking-tight mt-1 truncate',
                item.color,
              )}
            >
              {formatCurrency(item.value)}
            </p>
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
      title: 'Investimentos',
      value: stats.totalInvestment,
      icon: TrendingUp,
      color: 'text-blue-700',
    },
    {
      title: 'Pagos',
      value: stats.paidTotal,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      title: 'Gastos Fixos',
      value: stats.fixedExpenses,
      icon: AlertCircle,
      color: 'text-amber-500',
    },
  ];

  return (
    <div
      data-tone={tone}
      className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
    >
      {items.map((item) => (
        <Card
          key={item.title}
          className="overflow-hidden border-border bg-card shadow-md backdrop-blur-sm transition-colors hover:bg-accent/50 dark:border-border/40 dark:bg-card/50 dark:hover:bg-card/80 dark:shadow-none"
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
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-15 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
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
