'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

export type EntryType = 'receita' | 'despesa';

export interface Category {
  id: string;
  name: string;
  tone: string;
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
  addEntry: (entry: Omit<FinancialEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<FinancialEntry>) => void;
  deleteEntry: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  filters: {
    month: string;
    year: string;
    day: string;
    categoryId: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
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

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', tone: 'warning' },
  { id: '2', name: 'Transporte', tone: 'info' },
  { id: '3', name: 'Saúde', tone: 'error' },
  { id: '4', name: 'Lazer', tone: 'accent' },
  { id: '5', name: 'Salário', tone: 'success' },
];

export function FinanceiroProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [filters, setFilters] = useState({
    day: '',
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    categoryId: 'all',
  });

  // Load from LocalStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('life-os-financeiro-entries');
    const savedCategories = localStorage.getItem(
      'life-os-financeiro-categories',
    );

    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error('Failed to load financial entries', e);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Failed to load financial categories', e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('life-os-financeiro-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(
      'life-os-financeiro-categories',
      JSON.stringify(categories),
    );
  }, [categories]);

  const addEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setEntries((prev) => [...prev, newEntry]);
  };

  const updateEntry = (id: string, updatedFields: Partial<FinancialEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...updatedFields } : entry,
      ),
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: crypto.randomUUID() };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    // Reset categoryId in entries or handle it accordingly
    setEntries((prev) =>
      prev.map((entry) =>
        entry.categoryId === id ? { ...entry, categoryId: '' } : entry,
      ),
    );
  };

  const stats = useMemo(() => {
    // Base monthly entries (for global stats)
    const monthlyEntries = entries.filter((entry) => {
      const d = new Date(entry.date + 'T12:00:00');
      const mMatch =
        filters.month === '' || d.getMonth().toString() === filters.month;
      const yMatch =
        filters.year === '' || d.getFullYear().toString() === filters.year;
      return mMatch && yMatch;
    });

    // Fully filtered entries (if needed for something else, but stats usually big picture)
    const filtered = monthlyEntries.filter((entry) => {
      const d = new Date(entry.date + 'T12:00:00');
      const dMatch =
        filters.day === '' || d.getDate().toString() === filters.day;
      const cMatch =
        filters.categoryId === 'all' || entry.categoryId === filters.categoryId;
      return dMatch && cMatch;
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

    // Simplified forecast: Current Balance
    const forecast = balance;

    return {
      totalRevenue,
      totalExpense,
      balance,
      fixedExpenses,
      forecast,
      filtered, // Now used and returned
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
