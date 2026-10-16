'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { requestJson } from '@/lib/request-json';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export interface MetaTask {
  id: string;
  metaId: string;
  description: string;
  completed: boolean;
  isHighlighted: boolean;
  orderIndex: number;
}

export interface Meta {
  id: string;
  title: string;
  description: string | null;
  tone: string;
  tasks: MetaTask[];
}

interface MetaContextData {
  metas: Meta[];
  loading: boolean;
  isProcessing: boolean;
  addMeta: (data: {
    title: string;
    description?: string;
    tone: string;
  }) => Promise<void>;
  updateMeta: (id: string, data: Partial<Meta>) => Promise<void>;
  deleteMeta: (id: string) => Promise<void>;
  addTask: (metaId: string, data: { description: string }) => Promise<void>;
  updateTask: (
    metaId: string,
    taskId: string,
    data: Partial<MetaTask>,
  ) => Promise<void>;
  deleteTask: (metaId: string, taskId: string) => Promise<void>;
}

const MetaContext = createContext<MetaContextData>({} as MetaContextData);

export function MetaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadMetas = useCallback(async () => {
    if (!user) {
      setMetas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await requestJson<{ metas: Meta[] }>('/api/meta');
      setMetas(data.metas);
    } catch (error) {
      console.error('Failed to load metas:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMetas();
  }, [loadMetas]);

  // Every mutation endpoint returns the full, updated list of metas.
  const send = async (url: string, method: string, body?: unknown) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(url, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const addMeta = (data: {
    title: string;
    description?: string;
    tone: string;
  }) => send('/api/meta', 'POST', data);

  const updateMeta = (id: string, data: Partial<Meta>) =>
    send(`/api/meta/${id}`, 'PATCH', data);

  const deleteMeta = (id: string) => send(`/api/meta/${id}`, 'DELETE');

  const addTask = (metaId: string, data: { description: string }) =>
    send(`/api/meta/${metaId}/tasks`, 'POST', data);

  const updateTask = (
    metaId: string,
    taskId: string,
    data: Partial<MetaTask>,
  ) => send(`/api/meta/${metaId}/tasks/${taskId}`, 'PATCH', data);

  const deleteTask = (metaId: string, taskId: string) =>
    send(`/api/meta/${metaId}/tasks/${taskId}`, 'DELETE');

  return (
    <MetaContext.Provider
      value={{
        metas,
        loading,
        isProcessing,
        addMeta,
        updateMeta,
        deleteMeta,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
}

export const useMetaContext = () => useContext(MetaContext);
