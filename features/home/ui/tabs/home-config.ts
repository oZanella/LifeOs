'use client';

import {
  LayoutDashboard,
  Wallet,
  Target,
  CheckSquare,
  Dumbbell,
} from 'lucide-react';
import React from 'react';
import { type BadgeTone } from '@/components/ui/badge';
import { Dashboard } from '@/features/dashboard/dashboard';
import { Financeiro } from '@/features/financeiro/ui/view/financeiro';
import { Meta } from '@/features/meta/ui/view/meta';
import { Tarefa } from '@/features/tarefa/ui/view/tarefa';
import { Treino } from '@/features/treino/ui/view/treino';

export type PageType =
  | 'dashboard'
  | 'financeiro'
  | 'meta'
  | 'tarefa'
  | 'treino';

export interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  tone: BadgeTone;
  component: React.ComponentType;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tone: 'primary',
    component: Dashboard,
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    tone: 'success',
    component: Financeiro,
  },
  {
    id: 'meta',
    label: 'Metas',
    icon: Target,
    tone: 'warning',
    component: Meta,
  },
  {
    id: 'tarefa',
    label: 'Tarefas',
    icon: CheckSquare,
    tone: 'info',
    component: Tarefa,
  },
  {
    id: 'treino',
    label: 'Treino',
    icon: Dumbbell,
    tone: 'accent',
    component: Treino,
  },
];
