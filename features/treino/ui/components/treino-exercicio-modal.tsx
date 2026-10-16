'use client';

import { useState } from 'react';
import { Copy, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ExercicioForm,
  TreinoExercicio,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';
import { formatVolume } from '@/features/treino/application/treino-utils';

interface TreinoExercicioModalProps {
  treinoId: string;
  exercicio: TreinoExercicio | null;
  onClose: () => void;
}

// Sets are edited as text so the user can type "12,5" or leave a field blank.
type SetDraft = { reps: string; weight: string };

const MAX_SETS = 20;
const DEFAULT_SETS: SetDraft[] = [
  { reps: '', weight: '' },
  { reps: '', weight: '' },
  { reps: '', weight: '' },
];

const toDraft = (value: number | null) =>
  value === null ? '' : String(value).replace('.', ',');

const parseNumber = (value: string, integer: boolean) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return integer ? Math.round(parsed) : parsed;
};

const sanitizeDecimal = (value: string) => value.replace(/[^\d.,]/g, '');

export function TreinoExercicioModal({
  treinoId,
  exercicio,
  onClose,
}: TreinoExercicioModalProps) {
  const { addExercicio, updateExercicio, isProcessing } = useTreinoContext();
  const [name, setName] = useState(exercicio?.name ?? '');
  const [sets, setSets] = useState<SetDraft[]>(
    exercicio
      ? exercicio.sets.map((s) => ({
          reps: toDraft(s.reps),
          weight: toDraft(s.weight),
        }))
      : DEFAULT_SETS,
  );

  const parsedSets = sets.map((s) => ({
    reps: parseNumber(s.reps, true),
    weight: parseNumber(s.weight, false),
  }));
  const volume = parsedSets.reduce(
    (sum, s) => sum + (s.reps ?? 0) * (s.weight ?? 0),
    0,
  );

  const updateSet = (index: number, field: keyof SetDraft, value: string) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    );
  };

  // A new set copies the last one, which is how most sets are logged.
  const addSet = () => {
    setSets((prev) =>
      prev.length >= MAX_SETS
        ? prev
        : [...prev, prev[prev.length - 1] ?? { reps: '', weight: '' }],
    );
  };

  const removeSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const applyFirstToAll = () => {
    setSets((prev) => prev.map(() => ({ ...prev[0] })));
  };

  const stepWeight = (index: number, delta: number) => {
    const current = parseNumber(sets[index].weight, false) ?? 0;
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    updateSet(index, 'weight', toDraft(next));
  };

  const resetForNext = () => {
    setName('');
    setSets(DEFAULT_SETS);
  };

  const save = async (keepOpen: boolean) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const data: ExercicioForm = {
      name: trimmed,
      // Rows left completely blank are not real sets.
      sets: parsedSets.filter((s) => s.reps !== null || s.weight !== null),
    };

    try {
      if (exercicio) {
        await updateExercicio(treinoId, exercicio.id, data);
      } else {
        await addExercicio(treinoId, data);
      }
      if (keepOpen) {
        resetForNext();
      } else {
        onClose();
      }
    } catch {
      // The context already shows the error toast; keep the modal open.
    }
  };

  const canSave = Boolean(name.trim()) && !isProcessing;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(false);
          }}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>
              {exercicio ? 'Editar exercício' : 'Novo exercício'}
            </DialogTitle>
            <DialogDescription>
              Registre cada série com as repetições e a carga usada.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="exercicio-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Exercício
            </Label>
            <Input
              id="exercicio-name"
              autoFocus
              placeholder="Ex: Supino reto com barra"
              className="h-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Séries
              </Label>
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={applyFirstToAll}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Copy size={12} />
                  Repetir 1ª série em todas
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-[1fr_1.6fr_2.25rem] items-center gap-2 bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Reps</span>
                <span>Carga (kg)</span>
                <span />
              </div>

              {sets.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Nenhuma série. Adicione abaixo.
                </p>
              )}

              {sets.map((set, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1.6fr_2.25rem] items-center gap-2 border-t border-border/60 px-3 py-2"
                >
                  <Input
                    inputMode="numeric"
                    placeholder="12"
                    aria-label={`Repetições da série ${index + 1}`}
                    className="h-9 text-center tabular-nums"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        index,
                        'reps',
                        e.target.value.replace(/\D/g, ''),
                      )
                    }
                  />
                  <div className="flex items-center gap-1">
                    <StepButton
                      label="Diminuir carga"
                      onClick={() => stepWeight(index, -2.5)}
                    >
                      <Minus size={12} />
                    </StepButton>
                    <Input
                      inputMode="decimal"
                      placeholder="0"
                      aria-label={`Carga da série ${index + 1}`}
                      className="h-9 min-w-0 text-center tabular-nums"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(
                          index,
                          'weight',
                          sanitizeDecimal(e.target.value),
                        )
                      }
                    />
                    <StepButton
                      label="Aumentar carga"
                      onClick={() => stepWeight(index, 2.5)}
                    >
                      <Plus size={12} />
                    </StepButton>
                  </div>
                  <button
                    type="button"
                    title="Remover série"
                    onClick={() => removeSet(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSet}
                disabled={sets.length >= MAX_SETS}
                className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus size={14} />
                Adicionar série
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {sets.length} {sets.length === 1 ? 'série' : 'séries'}
              {volume > 0 && ` · volume ${formatVolume(volume)}`}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            {!exercicio && (
              <Button
                type="button"
                variant="outline"
                disabled={!canSave}
                onClick={() => save(true)}
                className="cursor-pointer"
              >
                Salvar e adicionar outro
              </Button>
            )}
            <Button
              type="submit"
              disabled={!canSave}
              className="cursor-pointer"
            >
              {isProcessing ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="hidden h-9 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer sm:flex"
    >
      {children}
    </button>
  );
}
