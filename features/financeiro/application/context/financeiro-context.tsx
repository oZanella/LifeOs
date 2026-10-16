'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { format } from 'date-fns';
import { BadgeTone } from '@/components/ui/badge';
import { requestJson } from '@/lib/request-json';
import { AppBadgeTone, VALID_CATEGORY_TONES } from '@/lib/tone-options';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export type EntryType = 'receita' | 'despesa' | 'investimento';
type PaymentStatusFilter = 'all' | 'paid' | 'unpaid';

export interface Category {
  id: string;
  name: string;
  tone: BadgeTone;
  parentId: string | null;
}

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  type: EntryType;
  isFixed: boolean;
  isPaid: boolean;
  isArchivedPaid: boolean;
  parentId?: string | null;
}

export interface FiltersType {
  type: string;
  paymentStatus: PaymentStatusFilter;
  month: string;
  year: string;
  day: string;
  categoryId: string;
}

interface FinanceiroContextData {
  entries: FinancialEntry[];
  filteredEntries: FinancialEntry[];
  archivedPaidEntries: FinancialEntry[];
  categories: Category[];

  addEntry: (entry: Omit<FinancialEntry, 'id'>) => Promise<string | null>;
  updateEntry: (id: string, entry: Partial<FinancialEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteEntries: (ids: string[]) => Promise<void>;
  setEntriesPaid: (ids: string[], isPaid: boolean) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
  isProcessing: boolean;
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  stats: {
    totalRevenue: number;
    totalExpense: number;
    totalInvestment: number;
    balance: number;
    fixedExpenses: number;
    paidTotal: number;
    forecast: number;
  };
  addRecurringEntries: (entry: FinancialEntry, months: number) => Promise<void>;
}

const FinanceiroContext = createContext<FinanceiroContextData>(
  {} as FinanceiroContextData,
);

const normalizeCategories = (categories: Category[]) =>
  categories.map((cat) => ({
    ...cat,
    tone: (VALID_CATEGORY_TONES.includes(cat.tone as AppBadgeTone)
      ? cat.tone
      : 'default') as BadgeTone,
  }));

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
    paymentStatus: 'all',
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
      setCategories(normalizeCategories(data.categories));
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

  const withProcessing = async <T,>(action: () => Promise<T>) => {
    setIsProcessing(true);
    try {
      return await action();
    } finally {
      setIsProcessing(false);
    }
  };

  // Entry/category endpoints return the full updated list.
  const sendEntries = (url: string, method: string, body?: unknown) =>
    withProcessing(async () => {
      const data = await requestJson<{
        entries: FinancialEntry[];
        createdEntryId?: string;
      }>(url, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setEntries(data.entries);
      return data.createdEntryId ?? null;
    });

  const sendCategories = (url: string, method: string, body?: unknown) =>
    withProcessing(async () => {
      const data = await requestJson<{ categories: Category[] }>(url, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setCategories(normalizeCategories(data.categories));
    });

  const addEntry = (entry: Omit<FinancialEntry, 'id'>) =>
    sendEntries('/api/financeiro/entries', 'POST', entry);

  const updateEntry = async (
    id: string,
    updatedFields: Partial<FinancialEntry>,
  ) => {
    await sendEntries(`/api/financeiro/entries/${id}`, 'PATCH', updatedFields);
  };

  const deleteEntry = async (id: string) => {
    await sendEntries(`/api/financeiro/entries/${id}`, 'DELETE');
  };

  const deleteEntries = async (ids: string[]) => {
    if (ids.length === 0) return;
    await sendEntries('/api/financeiro/entries/bulk', 'DELETE', { ids });
  };

  const setEntriesPaid = async (ids: string[], isPaid: boolean) => {
    if (ids.length === 0) return;
    await sendEntries('/api/financeiro/entries/bulk', 'PATCH', { ids, isPaid });
  };

  const addCategory = (category: Omit<Category, 'id'>) =>
    sendCategories('/api/financeiro/categories', 'POST', category);

  const updateCategory = (id: string, updatedFields: Partial<Category>) =>
    sendCategories(`/api/financeiro/categories/${id}`, 'PATCH', updatedFields);

  // Deleting a category clears it from entries, so both lists are reloaded.
  const deleteCategory = async (id: string) => {
    await sendCategories(`/api/financeiro/categories/${id}`, 'DELETE');
    await sendEntries('/api/financeiro', 'GET');
  };

  const addRecurringEntries = async (
    baseEntry: FinancialEntry,
    months: number,
  ) => {
    try {
      if (!baseEntry.isFixed) {
        await updateEntry(baseEntry.id, { isFixed: true });
      }

      const additionalEntries: Omit<FinancialEntry, 'id'>[] = [];
      const baseDate = new Date(`${baseEntry.date}T12:00:00`);

      for (let i = 1; i < months; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + i);

        // Handle month overflow (e.g., Jan 31 -> Feb 28/29 instead of Mar 2)
        if (nextDate.getDate() !== baseDate.getDate()) {
          nextDate.setDate(0);
        }

        additionalEntries.push({
          date: format(nextDate, 'yyyy-MM-dd'),
          description: baseEntry.description,
          categoryId: baseEntry.categoryId,
          amount: baseEntry.amount,
          type: baseEntry.type,
          isFixed: true,
          isPaid: false,
          isArchivedPaid: false,
          parentId: baseEntry.id,
        });
      }

      if (additionalEntries.length > 0) {
        await sendEntries('/api/financeiro/entries/bulk', 'POST', {
          entries: additionalEntries,
        });
      }
    } catch (error) {
      console.error('Failed to add recurring entries:', error);
    }
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpense = 0;
    let totalInvestment = 0;
    let fixedExpenses = 0;
    let paidTotal = 0;
    const filtered: FinancialEntry[] = [];
    const archivedPaid: FinancialEntry[] = [];

    const { month, year, day, categoryId, type, paymentStatus } = filters;
    const categoryParentById = new Map(
      categories.map((cat) => [cat.id, cat.parentId]),
    );

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      const [y, m, d] = entry.date.split('-');
      const entryMonth = (parseInt(m, 10) - 1).toString();
      const entryYear = y;
      const entryDay = parseInt(d, 10).toString();

      const mMatch = month === 'all' || month === '' || entryMonth === month;
      const yMatch = year === '' || entryYear === year;
      const dMatch = day === '' || entryDay === day;
      const cMatch =
        categoryId === 'all' ||
        entry.categoryId === categoryId ||
        categoryParentById.get(entry.categoryId) === categoryId;
      const tMatch = type === 'all' || entry.type === type;
      const pMatch =
        paymentStatus === 'all' ||
        (paymentStatus === 'paid' && entry.isPaid) ||
        (paymentStatus === 'unpaid' &&
          !entry.isPaid &&
          entry.type !== 'receita');

      const matches = mMatch && yMatch && dMatch && cMatch && tMatch && pMatch;

      if (matches) {
        if (entry.isArchivedPaid) {
          archivedPaid.push(entry);
        } else {
          filtered.push(entry);
        }

        if (entry.type === 'receita') {
          totalRevenue += entry.amount;
        } else if (entry.type === 'investimento') {
          totalInvestment += entry.amount;
          if (entry.isFixed) fixedExpenses += entry.amount;
        } else {
          totalExpense += entry.amount;
          if (entry.isFixed) fixedExpenses += entry.amount;
        }

        if (entry.isPaid && entry.type !== 'receita') {
          paidTotal += entry.amount;
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
      paidTotal,
      forecast: balance,
      filtered,
      archivedPaid,
    };
  }, [entries, filters, categories]);

  const { filtered, archivedPaid, ...computedStats } = stats;

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
        archivedPaidEntries: archivedPaid,
        addRecurringEntries,
        deleteEntries,
        setEntriesPaid,
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

export const useFinanceiroContext = () => useContext(FinanceiroContext);
