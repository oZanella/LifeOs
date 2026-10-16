'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { requestJson } from '@/lib/request-json';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export interface TreinoSet {
  reps: number | null;
  weight: number | null;
}

export interface TreinoExercicio {
  id: string;
  treinoId: string;
  name: string;
  sets: TreinoSet[];
  orderIndex: number;
}

export interface Treino {
  id: string;
  title: string;
  description: string | null;
  tone: string;
  exercicios: TreinoExercicio[];
}

export type ExercicioForm = {
  name: string;
  sets: TreinoSet[];
};

type TreinoForm = {
  title: string;
  description: string | null;
  tone: string;
};

interface TreinoContextData {
  treinos: Treino[];
  loading: boolean;
  isProcessing: boolean;
  addTreino: (data: TreinoForm) => Promise<string | undefined>;
  updateTreino: (id: string, data: Partial<TreinoForm>) => Promise<void>;
  deleteTreino: (id: string) => Promise<void>;
  addExercicio: (treinoId: string, data: ExercicioForm) => Promise<void>;
  updateExercicio: (
    treinoId: string,
    exercicioId: string,
    data: Partial<ExercicioForm>,
  ) => Promise<void>;
  deleteExercicio: (treinoId: string, exercicioId: string) => Promise<void>;
  reorderExercicios: (treinoId: string, orderedIds: string[]) => Promise<void>;
}

const TreinoContext = createContext<TreinoContextData>({} as TreinoContextData);

type TreinosResponse = { treinos: Treino[]; createdTreinoId?: string };

export function TreinoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadTreinos = useCallback(async () => {
    if (!user) {
      setTreinos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await requestJson<TreinosResponse>('/api/treino');
      setTreinos(data.treinos);
    } catch (error) {
      console.error('Failed to load treinos:', error);
      showToast({
        title: 'Não foi possível carregar os treinos.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTreinos();
  }, [loadTreinos]);

  // Every mutation endpoint returns the full, updated list of treinos.
  const mutate = async (
    url: string,
    method: string,
    successMessage: string | null,
    body?: unknown,
  ) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<TreinosResponse>(url, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setTreinos(resp.treinos);
      if (successMessage) showToast({ title: successMessage });
      return resp;
    } catch (error) {
      showToast({
        title: 'Erro ao salvar',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        severity: 'error',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const addTreino = async (data: TreinoForm) =>
    (await mutate('/api/treino', 'POST', 'Treino criado.', data))
      .createdTreinoId;

  const updateTreino = async (id: string, data: Partial<TreinoForm>) => {
    await mutate(`/api/treino/${id}`, 'PATCH', 'Treino atualizado.', data);
  };

  const deleteTreino = async (id: string) => {
    await mutate(`/api/treino/${id}`, 'DELETE', 'Treino excluído.');
  };

  const addExercicio = async (treinoId: string, data: ExercicioForm) => {
    await mutate(
      `/api/treino/${treinoId}/exercicios`,
      'POST',
      'Exercício adicionado.',
      data,
    );
  };

  const updateExercicio = async (
    treinoId: string,
    exercicioId: string,
    data: Partial<ExercicioForm>,
  ) => {
    await mutate(
      `/api/treino/${treinoId}/exercicios/${exercicioId}`,
      'PATCH',
      'Exercício atualizado.',
      data,
    );
  };

  const deleteExercicio = async (treinoId: string, exercicioId: string) => {
    await mutate(
      `/api/treino/${treinoId}/exercicios/${exercicioId}`,
      'DELETE',
      'Exercício excluído.',
    );
  };

  const reorderExercicios = async (treinoId: string, orderedIds: string[]) => {
    // Reorder locally first so the list doesn't jump while the request runs.
    setTreinos((prev) =>
      prev.map((treino) =>
        treino.id !== treinoId
          ? treino
          : {
              ...treino,
              exercicios: orderedIds
                .map((id) => treino.exercicios.find((e) => e.id === id))
                .filter((e): e is TreinoExercicio => Boolean(e)),
            },
      ),
    );
    await mutate(`/api/treino/${treinoId}/exercicios/reorder`, 'POST', null, {
      ids: orderedIds,
    });
  };

  return (
    <TreinoContext.Provider
      value={{
        treinos,
        loading,
        isProcessing,
        addTreino,
        updateTreino,
        deleteTreino,
        addExercicio,
        updateExercicio,
        deleteExercicio,
        reorderExercicios,
      }}
    >
      {children}
    </TreinoContext.Provider>
  );
}

export const useTreinoContext = () => useContext(TreinoContext);
