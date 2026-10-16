'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  Edit2,
  Layers,
  ListOrdered,
  Loader2,
  Plus,
  Trash2,
  Weight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { badgeVariants, BadgeTone } from '@/components/ui/badge';
import {
  Treino,
  TreinoExercicio,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';
import {
  formatVolume,
  getTreinoStats,
} from '@/features/treino/application/treino-utils';
import { FinanceiroConfirmDeleteModal } from '@/features/financeiro/ui/components/financeiro-confirm-delete-modal';
import { AppBadgeTone, TONE_DOT_CLASSNAME } from '@/lib/tone-options';
import { cn } from '@/lib/utils';
import { TreinoModal } from './treino-modal';
import { TreinoExercicioCard } from './treino-exercicio-card';
import { TreinoExercicioModal } from './treino-exercicio-modal';

interface TreinoDetailProps {
  treino: Treino;
  onBack: () => void;
}

export function TreinoDetail({ treino, onBack }: TreinoDetailProps) {
  const { deleteTreino, reorderExercicios, isProcessing } = useTreinoContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // undefined = closed, null = new exercise.
  const [modalExercicio, setModalExercicio] = useState<
    TreinoExercicio | null | undefined
  >(undefined);

  const stats = getTreinoStats(treino);
  const tone = treino.tone as AppBadgeTone;

  const moveExercicio = (index: number, direction: -1 | 1) => {
    const ids = treino.exercicios.map((e) => e.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderExercicios(treino.id, ids).catch(() => undefined);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-2 gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Treinos
        </Button>

        <div className="flex items-center gap-2">
          {isProcessing && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 cursor-pointer"
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-1.5 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40">
        <div
          className={cn(
            'h-1.5 w-full',
            TONE_DOT_CLASSNAME[tone] ?? 'bg-zinc-500',
          )}
        />
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                badgeVariants({ tone: tone as BadgeTone, variant: 'subtle' }),
                'h-14 w-14 shrink-0 justify-center rounded-2xl p-0 [&>svg]:size-7',
              )}
            >
              <Dumbbell />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight wrap-break-word">
                {treino.title}
              </h2>
              {treino.description && (
                <p className="mt-1 text-sm text-muted-foreground wrap-break-word">
                  {treino.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-auto">
            <StatTile
              icon={ListOrdered}
              label="Exercícios"
              value={String(stats.exercicios)}
            />
            <StatTile icon={Layers} label="Séries" value={String(stats.sets)} />
            <StatTile
              icon={Weight}
              label="Volume"
              value={stats.volume > 0 ? formatVolume(stats.volume) : '—'}
              hint="Soma de reps × carga de todas as séries"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Exercícios
        </h3>
        {treino.exercicios.length > 0 && (
          <Button
            onClick={() => setModalExercicio(null)}
            className="gap-2 cursor-pointer font-bold"
          >
            <Plus size={16} />
            Adicionar exercício
          </Button>
        )}
      </div>

      {treino.exercicios.length === 0 ? (
        <button
          type="button"
          onClick={() => setModalExercicio(null)}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center transition-colors hover:border-foreground/30 hover:bg-muted/20 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
            <Plus size={22} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold">Adicione o primeiro exercício</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre cada série com repetições e carga.
            </p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          {treino.exercicios.map((exercicio, index) => (
            <TreinoExercicioCard
              key={exercicio.id}
              exercicio={exercicio}
              index={index}
              isFirst={index === 0}
              isLast={index === treino.exercicios.length - 1}
              onEdit={() => setModalExercicio(exercicio)}
              onMoveUp={() => moveExercicio(index, -1)}
              onMoveDown={() => moveExercicio(index, 1)}
            />
          ))}
        </div>
      )}

      {modalExercicio !== undefined && (
        <TreinoExercicioModal
          treinoId={treino.id}
          exercicio={modalExercicio}
          onClose={() => setModalExercicio(undefined)}
        />
      )}

      {isEditOpen && (
        <TreinoModal treino={treino} onClose={() => setIsEditOpen(false)} />
      )}

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
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      title={hint}
      className="flex min-w-0 flex-col gap-1 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 sm:min-w-28 sm:px-4"
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon size={12} />
        {label}
      </span>
      <span className="truncate text-lg font-bold tabular-nums sm:text-xl">
        {value}
      </span>
    </div>
  );
}
