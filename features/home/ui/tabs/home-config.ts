import { BadgeTone } from '@/components/ui/badge';
import { Dashboard } from '@/features/dashboard/dashboard';
import { Financeiro } from '@/features/financeiro/ui/view/financeiro-view';
import { Meta } from '@/features/meta/ui/view/meta-view';
import { Tarefa } from '@/features/tarefa/ui/view/tarefa-view';
import { Treino } from '@/features/treino/ui/view/treino-view';

import { dashboard_config } from '@/features/dashboard/dashboard-config';
import { financeiro_config } from '@/features/financeiro/financeiro-config';
import { meta_config } from '@/features/meta/meta-config';
import { tarefa_config } from '@/features/tarefa/tarefa-config';
import { treino_config } from '@/features/treino/treino-config';

export type PageType =
  | 'dashboard'
  | 'financeiro'
  | 'meta'
  | 'tarefa'
  | 'treino';

export interface labelItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  tone: BadgeTone;
  component: React.ComponentType;
}

export const lab_itens: labelItem[] = [
  {
    ...(dashboard_config as Omit<labelItem, 'component'>),
    component: Dashboard,
  },
  {
    ...(financeiro_config as Omit<labelItem, 'component'>),
    component: Financeiro,
  },
  {
    ...(meta_config as Omit<labelItem, 'component'>),
    component: Meta,
  },
  {
    ...(tarefa_config as Omit<labelItem, 'component'>),
    component: Tarefa,
  },
  {
    ...(treino_config as Omit<labelItem, 'component'>),
    component: Treino,
  },
];
