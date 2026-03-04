import { BadgeTone } from '@/components/ui/badge';
import { Dashboard } from '@/features/dashboard/dashboard';
import { Financeiro } from '@/features/financeiro/ui/view/financeiro-view';
import { Meta } from '@/features/meta/ui/view/meta-view';
import { Tarefa } from '@/features/tarefa/ui/view/tarefa-view';
import { Treino } from '@/features/treino/ui/view/treino-view';
import {
  LayoutDashboard,
  Wallet,
  Target,
  CheckSquare,
  Dumbbell,
  Settings,
} from 'lucide-react';
import { HomeConfiguracoesView } from '../view/home-configuracoes-view';

export type PageType =
  | 'dashboard'
  | 'financeiro'
  | 'meta'
  | 'tarefa'
  | 'treino'
  | 'configuracoes';

export interface labelItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  tone: BadgeTone;
  component: React.ComponentType<{ tone?: BadgeTone }>;
  className?: string;
}

export const lab_itens: labelItem[] = [
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
    tone: 'secondary',
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
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    tone: 'neutral',
    component: HomeConfiguracoesView,
  },
];
