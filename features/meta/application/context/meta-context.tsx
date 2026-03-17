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
  refreshMetas: () => Promise<void>;
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

  const addMeta = async (data: {
    title: string;
    description?: string;
    tone: string;
  }) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>('/api/meta', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMeta = async (id: string, data: Partial<Meta>) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(`/api/meta/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMeta = async (id: string) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(`/api/meta/${id}`, {
        method: 'DELETE',
      });
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const addTask = async (metaId: string, data: { description: string }) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(
        `/api/meta/${metaId}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTask = async (
    metaId: string,
    taskId: string,
    data: Partial<MetaTask>,
  ) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(
        `/api/meta/${metaId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      );
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteTask = async (metaId: string, taskId: string) => {
    setIsProcessing(true);
    try {
      const resp = await requestJson<{ metas: Meta[] }>(
        `/api/meta/${metaId}/tasks/${taskId}`,
        {
          method: 'DELETE',
        },
      );
      setMetas(resp.metas);
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshMetas = async () => {
    await loadMetas();
  };

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
        refreshMetas,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
}

export const useMetaContext = () => useContext(MetaContext);
