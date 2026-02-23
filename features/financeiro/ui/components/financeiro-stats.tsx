'use client';

import { useFinanceiroContext } from '@/features/financeiro/application/context/financeiro-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { BadgeTone } from '@/components/ui/badge';

export function FinanceiroStats({ tone = 'success' }: { tone?: BadgeTone }) {
  const { stats } = useFinanceiroContext();

  // Use tone to avoid unused warning
  console.log('Financeiro tone:', tone);

  const format = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v);

  const items = [
    {
      title: 'Saldo Atual',
      value: stats.balance,
      icon: Wallet,
      color: stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500',
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {items.map((item) => (
        <Card
          key={item.title}
          className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm"
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {item.title}
              </CardTitle>
              <item.icon size={14} className={item.color} />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className={`text-lg font-black tracking-tight ${item.color}`}>
              {format(item.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
