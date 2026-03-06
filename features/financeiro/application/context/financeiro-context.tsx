'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { BadgeTone } from '@/components/ui/badge';
import { requestJson } from '@/lib/request-json';
import { AppBadgeTone, VALID_CATEGORY_TONES } from '@/lib/tone-options';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export type EntryType = 'receita' | 'despesa';

export interface Category {
  id: string;
  name: string;
  tone: BadgeTone;
}

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  type: EntryType;
  isFixed: boolean;
}

interface FinanceiroContextData {
  entries: FinancialEntry[];
  filteredEntries: FinancialEntry[];
  categories: Category[];

  addEntry: (entry: Omit<FinancialEntry, 'id'>) => Promise<string | null>;
  updateEntry: (id: string, entry: Partial<FinancialEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
  filters: {
    type: string;
    month: string;
    year: string;
    day: string;
    categoryId: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      type: string;
      month: string;
      year: string;
      day: string;
      categoryId: string;
    }>
  >;
  stats: {
    totalRevenue: number;
    totalExpense: number;
    balance: number;
    fixedExpenses: number;
    forecast: number;
  };
}

const FinanceiroContext = createContext<FinanceiroContextData>(
  {} as FinanceiroContextData,
);

const sanitizeTone = (tone: string) =>
  (VALID_CATEGORY_TONES.includes(tone as AppBadgeTone)
    ? tone
    : 'default') as BadgeTone;

export function FinanceiroProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    day: '',
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    categoryId: 'all',
  });

  const loadFinanceiro = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await requestJson<{
        entries: FinancialEntry[];
        categories: Category[];
      }>('/api/financeiro');

      setEntries(data.entries);
      setCategories(
        data.categories.map((cat) => ({
          ...cat,
          tone: sanitizeTone(String(cat.tone || 'default')),
        })),
      );
    } catch (error) {
      console.error(error);
      setEntries([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFinanceiro();
  }, [loadFinanceiro]);

  const addEntry = async (entry: Omit<FinancialEntry, 'id'>) => {
    const data = await requestJson<{
      entries: FinancialEntry[];
      createdEntryId?: string;
    }>('/api/financeiro/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });

    setEntries(data.entries);
    return data.createdEntryId ?? null;
  };

  const updateEntry = async (
    id: string,
    updatedFields: Partial<FinancialEntry>,
  ) => {
    const data = await requestJson<{ entries: FinancialEntry[] }>(
      `/api/financeiro/entries/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      },
    );

    setEntries(data.entries);
  };

  const deleteEntry = async (id: string) => {
    const data = await requestJson<{ entries: FinancialEntry[] }>(
      `/api/financeiro/entries/${id}`,
      {
        method: 'DELETE',
      },
    );

    setEntries(data.entries);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const data = await requestJson<{ categories: Category[] }>(
      '/api/financeiro/categories',
      {
        method: 'POST',
        body: JSON.stringify(category),
      },
    );

    setCategories(
      data.categories.map((cat) => ({
        ...cat,
        tone: sanitizeTone(String(cat.tone || 'default')),
      })),
    );
  };

  const updateCategory = async (
    id: string,
    updatedFields: Partial<Category>,
  ) => {
    const data = await requestJson<{ categories: Category[] }>(
      `/api/financeiro/categories/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updatedFields),
      },
    );

    setCategories(
      data.categories.map((cat) => ({
        ...cat,
        tone: sanitizeTone(String(cat.tone || 'default')),
      })),
    );
  };

  const deleteCategory = async (id: string) => {
    const categoriesData = await requestJson<{ categories: Category[] }>(
      `/api/financeiro/categories/${id}`,
      {
        method: 'DELETE',
      },
    );
    const financeiroData = await requestJson<{
      entries: FinancialEntry[];
      categories: Category[];
    }>('/api/financeiro');

    setCategories(
      categoriesData.categories.map((cat) => ({
        ...cat,
        tone: sanitizeTone(String(cat.tone || 'default')),
      })),
    );
    setEntries(financeiroData.entries);
  };

  const stats = useMemo(() => {
    const monthlyEntries = entries.filter((entry) => {
      const d = new Date(entry.date + 'T12:00:00');
      const mMatch =
        filters.month === '' || d.getMonth().toString() === filters.month;
      const yMatch =
        filters.year === '' || d.getFullYear().toString() === filters.year;
      return mMatch && yMatch;
    });

    const filtered = monthlyEntries.filter((entry) => {
      const d = new Date(entry.date + 'T12:00:00');
      const dMatch =
        filters.day === '' || d.getDate().toString() === filters.day;
      const cMatch =
        filters.categoryId === 'all' || entry.categoryId === filters.categoryId;
      const tMatch =
        !filters.type || filters.type === 'all' || entry.type === filters.type;
      return dMatch && cMatch && tMatch;
    });

    const totalRevenue = monthlyEntries
      .filter((e) => e.type === 'receita')
      .reduce((acc, e) => acc + e.amount, 0);

    const totalExpense = monthlyEntries
      .filter((e) => e.type === 'despesa')
      .reduce((acc, e) => acc + e.amount, 0);

    const fixedExpenses = monthlyEntries
      .filter((e) => e.type === 'despesa' && e.isFixed)
      .reduce((acc, e) => acc + e.amount, 0);

    const balance = totalRevenue - totalExpense;
    const forecast = balance;

    return {
      totalRevenue,
      totalExpense,
      balance,
      fixedExpenses,
      forecast,
      filtered,
    };
  }, [entries, filters]);

  const { filtered, ...computedStats } = stats;

  return (
    <FinanceiroContext.Provider
      value={{
        entries,
        categories,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
        loading,
        filters,
        setFilters,
        stats: computedStats,
        filteredEntries: filtered,
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

export const useFinanceiroContext = () => useContext(FinanceiroContext);
