'use client';

import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { Card, CardContent } from '@/components/ui/card';
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

interface StatItem {
  title: string;
  value: number;
  icon: typeof Wallet;
  color: string;
  bg: string;
}

function StatCard({ item }: { item: StatItem }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center gap-3 px-4 py-3.5">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            item.bg,
          )}
        >
          <item.icon size={17} className={item.color} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            {item.title}
          </p>
          <p className={cn('truncate text-base font-semibold tabular-nums', item.color)}>
            {formatCurrency(item.value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function buildItems(stats: StatsData): StatItem[] {
  const balancePositive = stats.balance >= 0;

  return [
    {
      title: 'Saldo atual',
      value: stats.balance,
      icon: Wallet,
      color: balancePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bg: balancePositive ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
    {
      title: 'Receitas',
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Despesas',
      value: stats.totalExpense,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Investimentos',
      value: stats.totalInvestment,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Pagos',
      value: stats.paidTotal,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Gastos fixos',
      value: stats.fixedExpenses,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-17 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function FinanceiroStats({}: { tone?: BadgeTone }) {
  const { stats, loading } = useFinanceiroContext();

  if (loading) return <StatsSkeleton />;

  const items = buildItems(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <StatCard key={item.title} item={item} />
      ))}
    </div>
  );
}
