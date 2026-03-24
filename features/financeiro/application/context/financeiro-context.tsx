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

export type EntryType = 'receita' | 'despesa' | 'investimento';

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
  parentId?: string | null;
}

export interface FiltersType {
  type: string;
  month: string;
  year: string;
  day: string;
  categoryId: string;
}

interface FinanceiroContextData {
  entries: FinancialEntry[];
  filteredEntries: FinancialEntry[];
  categories: Category[];

  addEntry: (entry: Omit<FinancialEntry, 'id'>) => Promise<string | null>;
  updateEntry: (id: string, entry: Partial<FinancialEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteEntries: (ids: string[]) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
  isProcessing: boolean;
  filters: FiltersType;
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
    totalInvestment: number;
    balance: number;
    fixedExpenses: number;
    forecast: number;
  };
  addRecurringEntries: (entry: FinancialEntry, months: number) => Promise<void>;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({
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
    setIsProcessing(true);
    try {
      const data = await requestJson<{
        entries: FinancialEntry[];
        createdEntryId?: string;
      }>('/api/financeiro/entries', {
        method: 'POST',
        body: JSON.stringify(entry),
      });

      setEntries(data.entries);
      return data.createdEntryId ?? null;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateEntry = async (
    id: string,
    updatedFields: Partial<FinancialEntry>,
  ) => {
    setIsProcessing(true);
    try {
      const data = await requestJson<{ entries: FinancialEntry[] }>(
        `/api/financeiro/entries/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updatedFields),
        },
      );

      setEntries(data.entries);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setIsProcessing(true);
    try {
      const data = await requestJson<{ entries: FinancialEntry[] }>(
        `/api/financeiro/entries/${id}`,
        {
          method: 'DELETE',
        },
      );

      setEntries(data.entries);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteEntries = async (ids: string[]) => {
    if (ids.length === 0) return;
    setIsProcessing(true);
    try {
      const data = await requestJson<{ entries: FinancialEntry[] }>(
        '/api/financeiro/entries/bulk',
        {
          method: 'DELETE',
          body: JSON.stringify({ ids }),
        },
      );

      setEntries(data.entries);
    } finally {
      setIsProcessing(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    setIsProcessing(true);
    try {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCategory = async (
    id: string,
    updatedFields: Partial<Category>,
  ) => {
    setIsProcessing(true);
    try {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsProcessing(true);
    try {
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
    } finally {
      setIsProcessing(false);
    }
  };

  const addRecurringEntries = async (
    baseEntry: FinancialEntry,
    months: number,
  ) => {
    setIsProcessing(true);
    try {
      // 1. Mark current as fixed if not already
      if (!baseEntry.isFixed) {
        await updateEntry(baseEntry.id, { isFixed: true });
      }

      // 2. Build additional entries
      const additionalEntries: Omit<FinancialEntry, 'id'>[] = [];
      const baseDate = new Date(`${baseEntry.date}T12:00:00`);

      for (let i = 1; i < months; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + i);

        // Handle month overflow (e.g., Jan 31 -> Feb 28/29 instead of Mar 2)
        if (nextDate.getDate() !== baseDate.getDate()) {
          nextDate.setDate(0);
        }

        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');

        additionalEntries.push({
          date: `${year}-${month}-${day}`,
          description: baseEntry.description,
          categoryId: baseEntry.categoryId,
          amount: baseEntry.amount,
          type: baseEntry.type,
          isFixed: true,
          parentId: baseEntry.id,
        });
      }

      // 3. Save additional entries if any
      if (additionalEntries.length > 0) {
        const data = await requestJson<{ entries: FinancialEntry[] }>(
          '/api/financeiro/entries/bulk',
          {
            method: 'POST',
            body: JSON.stringify({ entries: additionalEntries }),
          },
        );
        setEntries(data.entries);
      } else {
        // If only current month, refresh entries to show fixed state
        const data = await requestJson<{
          entries: FinancialEntry[];
          categories: Category[];
        }>('/api/financeiro');
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Failed to add recurring entries:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpense = 0;
    let totalInvestment = 0;
    let fixedExpenses = 0;
    const filtered: FinancialEntry[] = [];

    const { month, year, day, categoryId, type } = filters;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      const [y, m, d] = entry.date.split('-');
      const entryMonth = (parseInt(m, 10) - 1).toString();
      const entryYear = y;
      const entryDay = parseInt(d, 10).toString();

      const mMatch = month === 'all' || month === '' || entryMonth === month;
      const yMatch = year === '' || entryYear === year;
      const dMatch = day === '' || entryDay === day;
      const cMatch = categoryId === 'all' || entry.categoryId === categoryId;
      const tMatch = type === 'all' || entry.type === type;

      const matches = mMatch && yMatch && dMatch && cMatch && tMatch;

      if (matches) {
        filtered.push(entry);

        if (entry.type === 'receita') {
          totalRevenue += entry.amount;
        } else if (entry.type === 'investimento') {
          totalInvestment += entry.amount;
          if (entry.isFixed) fixedExpenses += entry.amount;
        } else {
          totalExpense += entry.amount;
          if (entry.isFixed) fixedExpenses += entry.amount;
        }
      }
    }

    const balance = totalRevenue - totalExpense - totalInvestment;

    return {
      totalRevenue,
      totalExpense,
      totalInvestment,
      balance,
      fixedExpenses,
      forecast: balance,
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
        isProcessing,
        filters,
        setFilters,
        stats: computedStats,
        filteredEntries: filtered,
        addRecurringEntries,
        deleteEntries,
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

export const useFinanceiroContext = () => useContext(FinanceiroContext);
