'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import {
  TreinoExercicio,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';
import {
  formatVolume,
  formatWeight,
  getExercicioStats,
} from '@/features/treino/application/treino-utils';
import { FinanceiroConfirmDeleteModal } from '@/features/financeiro/ui/components/financeiro-confirm-delete-modal';
import { cn } from '@/lib/utils';

interface TreinoExercicioCardProps {
  exercicio: TreinoExercicio;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function TreinoExercicioCard({
  exercicio,
  index,
  isFirst,
  isLast,
  onEdit,
  onMoveUp,
  onMoveDown,
}: TreinoExercicioCardProps) {
  const { deleteExercicio } = useTreinoContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const stats = getExercicioStats(exercicio);

  return (
    <div className="group rounded-2xl border border-border bg-card/40 p-4 shadow-sm transition-colors hover:border-border/80 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-0.5">
          <IconButton
            title="Mover para cima"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ChevronUp size={14} />
          </IconButton>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold tabular-nums">
            {index + 1}
          </span>
          <IconButton
            title="Mover para baixo"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ChevronDown size={14} />
          </IconButton>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onEdit}
                className="text-left text-base font-bold tracking-tight wrap-break-word hover:underline cursor-pointer"
              >
                {exercicio.name}
              </button>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {stats.sets} {stats.sets === 1 ? 'série' : 'séries'}
                </span>
                {stats.maxWeight !== null && (
                  <span>Carga máx. {formatWeight(stats.maxWeight)} kg</span>
                )}
                {stats.volume > 0 && (
                  <span>Volume {formatVolume(stats.volume)}</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                title="Editar"
                onClick={onEdit}
                className="hover:text-blue-500"
              >
                <Edit2 size={14} />
              </IconButton>
              <IconButton
                title="Excluir"
                onClick={() => setIsDeleteOpen(true)}
                className="hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </div>

          {exercicio.sets.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {exercicio.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="flex flex-col rounded-xl border border-border/60 bg-background/50 px-3 py-2"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Série {setIndex + 1}
                  </span>
                  <span className="mt-0.5 text-sm font-bold tabular-nums">
                    {set.reps ?? '–'}
                    <span className="font-medium text-muted-foreground">
                      {' '}
                      reps
                    </span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {set.weight !== null
                      ? `${formatWeight(set.weight)} kg`
                      : 'Sem carga'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Nenhuma série registrada — clique para adicionar
            </button>
          )}
        </div>
      </div>

      <FinanceiroConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() =>
          deleteExercicio(exercicio.treinoId, exercicio.id).catch(
            () => undefined,
          )
        }
        title="Excluir exercício"
        description={`O exercício "${exercicio.name}" e suas séries serão excluídos.`}
      />
    </div>
  );
}

function IconButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer',
        'disabled:pointer-events-none disabled:opacity-25',
        className,
      )}
      {...props}
    />
  );
}
