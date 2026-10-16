import {
  Treino,
  TreinoExercicio,
  TreinoSet,
} from '@/features/treino/application/context/treino-context';

export const formatWeight = (weight: number) =>
  weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export const formatVolume = (volume: number) =>
  volume >= 1000
    ? `${(volume / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`
    : `${formatWeight(volume)} kg`;

const setVolume = (set: TreinoSet) => (set.reps ?? 0) * (set.weight ?? 0);

export function getExercicioStats(exercicio: TreinoExercicio) {
  const weights = exercicio.sets
    .map((s) => s.weight)
    .filter((w): w is number => w !== null);

  return {
    sets: exercicio.sets.length,
    volume: exercicio.sets.reduce((sum, set) => sum + setVolume(set), 0),
    maxWeight: weights.length > 0 ? Math.max(...weights) : null,
  };
}

// Short description such as "3 × 12" or "4 × 8–12" for summaries.
export function summarizeSets(sets: TreinoSet[]) {
  if (sets.length === 0) return null;

  const reps = sets
    .map((s) => s.reps)
    .filter((r): r is number => r !== null);
  if (reps.length === 0) return `${sets.length} séries`;

  const min = Math.min(...reps);
  const max = Math.max(...reps);
  return `${sets.length} × ${min === max ? min : `${min}–${max}`}`;
}

export function getTreinoStats(treino: Treino) {
  return {
    exercicios: treino.exercicios.length,
    sets: treino.exercicios.reduce((sum, e) => sum + e.sets.length, 0),
    volume: treino.exercicios.reduce(
      (sum, e) => sum + getExercicioStats(e).volume,
      0,
    ),
  };
}
