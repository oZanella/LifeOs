'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Dumbbell,
  Edit2,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { badgeVariants, BadgeTone } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Treino,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';
import {
  formatVolume,
  formatWeight,
  getExercicioStats,
  getTreinoStats,
  summarizeSets,
} from '@/features/treino/application/treino-utils';
import { FinanceiroConfirmDeleteModal } from '@/features/financeiro/ui/components/financeiro-confirm-delete-modal';
import { AppBadgeTone, TONE_DOT_CLASSNAME } from '@/lib/tone-options';
import { cn } from '@/lib/utils';

interface TreinoCardProps {
  treino: Treino;
  onOpen: () => void;
  onEdit: () => void;
}

const PREVIEW_LIMIT = 4;

export function TreinoCard({ treino, onOpen, onEdit }: TreinoCardProps) {
  const { deleteTreino } = useTreinoContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const stats = getTreinoStats(treino);
  const tone = treino.tone as AppBadgeTone;
  const preview = treino.exercicios.slice(0, PREVIEW_LIMIT);
  const hiddenCount = treino.exercicios.length - preview.length;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/40 text-left cursor-pointer',
          'shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <div
          className={cn(
            'h-1 w-full shrink-0',
            TONE_DOT_CLASSNAME[tone] ?? 'bg-zinc-500',
          )}
        />

        <div className="flex items-start gap-3 p-5 pb-4">
          <div
            className={cn(
              badgeVariants({ tone: tone as BadgeTone, variant: 'subtle' }),
              'h-11 w-11 shrink-0 justify-center rounded-xl p-0 [&>svg]:size-5',
            )}
          >
            <Dumbbell />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight">
              {treino.title}
            </h3>
            {treino.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {treino.description}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                Sem descrição
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="-mr-2 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer outline-none"
            >
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit2 size={14} />
                Editar treino
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="cursor-pointer"
              >
                <Trash2 size={14} />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mx-5 grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/60 bg-background/40 py-2.5">
          <Stat label="Exercícios" value={String(stats.exercicios)} />
          <Stat label="Séries" value={String(stats.sets)} />
          <Stat
            label="Volume"
            value={stats.volume > 0 ? formatVolume(stats.volume) : '—'}
          />
        </div>

        <div className="flex flex-1 flex-col px-5 pt-4 pb-2">
          {preview.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-6 text-xs text-muted-foreground">
              <Plus size={16} />
              Abra o treino para adicionar exercícios
            </div>
          ) : (
            <ul className="space-y-1">
              {preview.map((exercicio, index) => {
                const summary = summarizeSets(exercicio.sets);
                const { maxWeight } = getExercicioStats(exercicio);
                return (
                  <li
                    key={exercicio.id}
                    className="flex items-center gap-3 rounded-lg py-1.5 text-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {exercicio.name}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {[
                        summary,
                        maxWeight !== null ? `${formatWeight(maxWeight)} kg` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </li>
                );
              })}
              {hiddenCount > 0 && (
                <li className="pl-8 pt-1 text-xs text-muted-foreground">
                  + {hiddenCount}{' '}
                  {hiddenCount === 1 ? 'exercício' : 'exercícios'}
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
          Abrir treino
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </div>

      <FinanceiroConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteTreino(treino.id).catch(() => undefined)}
        title="Excluir treino"
        description={
          treino.exercicios.length > 0
            ? `O treino "${treino.title}" e seus ${treino.exercicios.length} exercício(s) serão excluídos.`
            : `O treino "${treino.title}" será excluído.`
        }
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2">
      <span className="text-base font-bold tabular-nums">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
