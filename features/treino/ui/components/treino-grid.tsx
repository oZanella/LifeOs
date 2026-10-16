'use client';

import { useState } from 'react';
import { Plus, Dumbbell, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTreinoContext,
  Treino,
} from '@/features/treino/application/context/treino-context';
import { getTreinoStats } from '@/features/treino/application/treino-utils';
import { TreinoCard } from './treino-card';
import { TreinoModal } from './treino-modal';

interface TreinoGridProps {
  onOpen: (treinoId: string) => void;
}

export function TreinoGrid({ onOpen }: TreinoGridProps) {
  const { treinos, loading, isProcessing } = useTreinoContext();
  const [modalTreino, setModalTreino] = useState<Treino | null | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim().toLowerCase();
  const filteredTreinos = treinos.filter(
    (treino) =>
      treino.title.toLowerCase().includes(query) ||
      treino.description?.toLowerCase().includes(query) ||
      treino.exercicios.some((e) => e.name.toLowerCase().includes(query)),
  );

  const totals = treinos.reduce(
    (acc, treino) => {
      const stats = getTreinoStats(treino);
      return {
        exercicios: acc.exercicios + stats.exercicios,
        sets: acc.sets + stats.sets,
      };
    },
    { exercicios: 0, sets: 0 },
  );

  if (loading && treinos.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-4"
            >
              <div className="flex gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-14 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meus treinos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {treinos.length === 0
              ? 'Monte suas fichas e registre cargas e repetições.'
              : `${treinos.length} ${treinos.length === 1 ? 'treino' : 'treinos'} · ${totals.exercicios} exercícios · ${totals.sets} séries`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {treinos.length > 0 && (
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar treino ou exercício..."
                className="pl-9 h-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <Button
            onClick={() => setModalTreino(null)}
            className="gap-2 h-10 px-5 font-bold shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            Novo treino
          </Button>
        </div>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Salvando alterações...
        </div>
      )}

      {filteredTreinos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <Dumbbell size={32} className="text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {searchQuery ? 'Nenhum resultado' : 'Nenhum treino ainda'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
            {searchQuery
              ? `Não encontramos nada para "${searchQuery}".`
              : 'Crie um treino para cada divisão (ex: Treino A – Peito e Tríceps) e adicione os exercícios com séries, repetições e carga.'}
          </p>
          {!searchQuery && (
            <Button
              className="mt-6 gap-2 cursor-pointer"
              onClick={() => setModalTreino(null)}
            >
              <Plus size={16} />
              Criar primeiro treino
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredTreinos.map((treino) => (
            <TreinoCard
              key={treino.id}
              treino={treino}
              onOpen={() => onOpen(treino.id)}
              onEdit={() => setModalTreino(treino)}
            />
          ))}
        </div>
      )}

      {modalTreino !== undefined && (
        <TreinoModal
          treino={modalTreino}
          onClose={() => setModalTreino(undefined)}
          onCreated={onOpen}
        />
      )}
    </div>
  );
}
