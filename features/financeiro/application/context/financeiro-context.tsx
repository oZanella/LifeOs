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

  const stats = useMemo(() => {
    const totalRevenueArr: number[] = [];
    const totalExpenseArr: number[] = [];
    const fixedExpensesArr: number[] = [];
    const filtered: FinancialEntry[] = [];

    const fMonth = filters.month;
    const fYear = filters.year;
    const fDay = filters.day;
    const fCategoryId = filters.categoryId;
    const fType = filters.type;

    for (const entry of entries) {
      // entry.date is YYYY-MM-DD
      const [year, month, day] = entry.date.split('-');
      const entryMonth = (parseInt(month, 10) - 1).toString();
      const entryYear = year;
      const entryDay = parseInt(day, 10).toString();

      const mMatch = fMonth === '' || entryMonth === fMonth;
      const yMatch = fYear === '' || entryYear === fYear;

      if (mMatch && yMatch) {
        if (entry.type === 'receita') totalRevenueArr.push(entry.amount);
        else {
          totalExpenseArr.push(entry.amount);
          if (entry.isFixed) fixedExpensesArr.push(entry.amount);
        }

        const dMatch = fDay === '' || entryDay === fDay;
        const cMatch =
          fCategoryId === 'all' || entry.categoryId === fCategoryId;
        const tMatch = !fType || fType === 'all' || entry.type === fType;

        if (dMatch && cMatch && tMatch) {
          filtered.push(entry);
        }
      }
    }

    const totalRevenue = totalRevenueArr.reduce((acc, v) => acc + v, 0);
    const totalExpense = totalExpenseArr.reduce((acc, v) => acc + v, 0);
    const fixedExpenses = fixedExpensesArr.reduce((acc, v) => acc + v, 0);
    const balance = totalRevenue - totalExpense;

    return {
      totalRevenue,
      totalExpense,
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
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

export const useFinanceiroContext = () => useContext(FinanceiroContext);
