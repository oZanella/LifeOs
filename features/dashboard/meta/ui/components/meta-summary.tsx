'use client';

import { useMetaContext } from '@/features/meta/application/context/meta-context';
import { cn } from '@/lib/utils';
import { Target, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';

export function MetaSummary() {
  const { metas, loading } = useMetaContext();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-muted/20 border border-border/40"
          />
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
      label: 'Metas Ativas',
      value: totalMetas,
      icon: Target,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Concluídas',
      value: completedMetas,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Progresso Geral',
      value: `${overallProgress}%`,
      icon: ArrowUpRight,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/30 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-card/50"
          >
            <div className={cn('p-3 rounded-xl shrink-0', stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-black text-foreground tabular-nums">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
          <Target size={120} />
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex flex-col">
            <h3 className="text-base font-black tracking-tight text-foreground/90">
              Metas em Destaque
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              Seu foco atual e nível de progresso
            </p>
          </div>
        </div>

        {metas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
            <Target size={32} className="text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              Nenhuma meta cadastrada ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {metas.slice(0, 4).map((meta) => {
              const mTasks = meta.tasks || [];
              const cTasks = mTasks.filter((t) => t.completed).length;
              const progress =
                mTasks.length > 0
                  ? Math.round((cTasks / mTasks.length) * 100)
                  : 0;

              return (
                <div key={meta.id} className="space-y-3 group/item">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                        style={{
                          backgroundColor: `var(--${meta.tone || 'laranja'})`,
                        }}
                      />
                      <span className="text-sm font-bold truncate text-foreground/80 group-hover/item:text-foreground transition-colors">
                        {meta.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-black tabular-nums text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: `var(--${meta.tone || 'laranja'})`,
                        boxShadow: `0 0 10px var(--${meta.tone || 'laranja'})50`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {mTasks.length}{' '}
                      {mTasks.length === 1 ? 'Tarefa' : 'Tarefas'}
                    </span>
                    <span className="flex items-center gap-1">
                      {cTasks} Concluídas
                      {progress === 100 && (
                        <CheckCircle2 size={10} className="text-emerald-500" />
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
