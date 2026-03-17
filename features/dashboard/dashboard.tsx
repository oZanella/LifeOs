'use client';

import { PageContainer } from '@/components/page/page-container';
import { useHomeUserConfig } from '../home/home-user-config';
import { BadgeTone } from '@/components/ui/badge';
import { FinanceiroProvider } from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroCharts } from '../financeiro/ui/components/financeiro-charts';
import { Wallet, Target } from 'lucide-react';
import { MetaProvider } from '@/features/meta/application/context/meta-context';
import { MetaSummary } from './meta/ui/components/meta-summary';

interface DashboardProps {
  tone?: BadgeTone;
}

export function Dashboard({}: DashboardProps) {
  const userConfig = useHomeUserConfig();
  const userName = userConfig.name;

  return (
    <FinanceiroProvider>
      <MetaProvider>
        <PageContainer className="bg-background gap-8 pt-4 flex flex-col h-full overflow-hidden">
          <section className="px-1 shrink-0">
            <h1 className="text-2xl font-black tracking-tight text-foreground/90">
              Olá, <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Acompanhe o resumo das suas atividades.
            </p>
          </section>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-10 pb-10 custom-scrollbar">
            {/* Seção Financeira */}
            <section className="space-y-4 shrink-0">
              <div className="flex items-center gap-3 px-1 border-b border-border/40 pb-3">
                <div className="p-2 rounded-xl bg-(--receita)/10 text-(--receita)">
                  <Wallet size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-foreground/90 leading-tight">
                    Gestão Financeira
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                    Resumo de saldos e indicadores mensais
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <FinanceiroCharts />
              </div>
            </section>

            {/* Seção de Metas */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-1 border-b border-border/40 pb-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <Target size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-foreground/90 leading-tight">
                    Metas & Objetivos
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                    Acompanhamento de progresso e conquistas
                  </p>
                </div>
              </div>

              <MetaSummary />
            </section>
          </div>
        </PageContainer>
      </MetaProvider>
    </FinanceiroProvider>
  );
}
