'use client';

import { useMetaContext } from '@/features/meta/application/context/meta-context';
import { Target, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';

export function MetaSummary() {
  const { metas, loading } = useMetaContext();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-18 rounded-2xl bg-muted/40" />
        ))}
      </div>
    );
  }

  const totalMetas = metas.length;
  const completedMetas = metas.filter((m) => {
    const totalTasks = m.tasks?.length || 0;
    const completedTasks = m.tasks?.filter((t) => t.completed).length || 0;
    return totalTasks > 0 && totalTasks === completedTasks;
  }).length;

  const totalTasks = metas.reduce((acc, m) => acc + (m.tasks?.length || 0), 0);
  const completedTasks = metas.reduce(
    (acc, m) => acc + (m.tasks?.filter((t) => t.completed).length || 0),
    0,
  );

  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Metas ativas',
      value: totalMetas,
      icon: Target,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Concluídas',
      value: completedMetas,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Progresso geral',
      value: `${overallProgress}%`,
      icon: ArrowUpRight,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}
            >
              <stat.icon size={17} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">
            Metas em destaque
          </h3>
          <p className="text-xs text-muted-foreground">
            Seu foco atual e nível de progresso
          </p>
        </div>

        {metas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma meta cadastrada ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {metas.slice(0, 4).map((meta) => {
              const mTasks = meta.tasks || [];
              const cTasks = mTasks.filter((t) => t.completed).length;
              const progress =
                mTasks.length > 0
                  ? Math.round((cTasks / mTasks.length) * 100)
                  : 0;

              return (
                <div key={meta.id} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: `var(--${meta.tone || 'laranja'})`,
                        }}
                      />
                      <span className="text-sm font-medium truncate text-foreground">
                        {meta.title}
                      </span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: `var(--${meta.tone || 'laranja'})`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {mTasks.length}{' '}
                      {mTasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                    <span className="flex items-center gap-1">
                      {cTasks} concluídas
                      {progress === 100 && (
                        <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
