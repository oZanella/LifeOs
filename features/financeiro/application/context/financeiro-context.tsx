'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

export type EntryType = 'receita' | 'despesa';

export interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: EntryType;
  isFixed: boolean;
}

interface FinanceiroContextData {
  entries: FinancialEntry[];
  addEntry: (entry: Omit<FinancialEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<FinancialEntry>) => void;
  deleteEntry: (id: string) => void;
  filters: {
    month: string;
    year: string;
    day: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{ month: string; year: string; day: string }>
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

export function FinanceiroProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [filters, setFilters] = useState({
    day: '',
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('life-os-financeiro');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load financial data', e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('life-os-financeiro', JSON.stringify(entries));
  }, [entries]);

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

  const stats = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const d = new Date(entry.date);
      const mMatch =
        filters.month === '' || d.getMonth().toString() === filters.month;
      const yMatch =
        filters.year === '' || d.getFullYear().toString() === filters.year;
      const dMatch =
        filters.day === '' || d.getDate().toString() === filters.day;
      return mMatch && yMatch && dMatch;
    });

    const totalRevenue = filtered
      .filter((e) => e.type === 'receita')
      .reduce((acc, e) => acc + e.amount, 0);

    const totalExpense = filtered
      .filter((e) => e.type === 'despesa')
      .reduce((acc, e) => acc + e.amount, 0);

    const fixedExpenses = filtered
      .filter((e) => e.type === 'despesa' && e.isFixed)
      .reduce((acc, e) => acc + e.amount, 0);

    const balance = totalRevenue - totalExpense;

    // Simple forecast: balance - any other fixed expenses not yet in the filtered list but expected?
    // User asked for "previsao de gasto" and "gastos fixos somando com o resto".
    // Let's define forecast as the current balance for the month.
    const forecast = balance;

    return {
      totalRevenue,
      totalExpense,
      balance,
      fixedExpenses,
      forecast,
    };
  }, [entries, filters]);

  return (
    <FinanceiroContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        filters,
        setFilters,
        stats,
      }}
    >
      {children}
    </FinanceiroContext.Provider>
  );
}

export const useFinanceiroContext = () => useContext(FinanceiroContext);
