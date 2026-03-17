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
  disabled?: boolean;
}

export const lab_itens: labelItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tone: 'info',
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
    tone: 'indigo',
    component: Meta,
  },
  {
    id: 'tarefa',
    label: 'Tarefas - em desenvolvimento',
    icon: CheckSquare,
    tone: 'info',
    component: Tarefa,
    disabled: true,
  },
  {
    id: 'treino',
    label: 'Treino - em desenvolvimento',
    icon: Dumbbell,
    tone: 'accent',
    component: Treino,
    disabled: true,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    tone: 'lime',
    component: HomeConfiguracoesView,
  },
];
