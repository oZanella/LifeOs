'use client';

import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@/components/page/page-container';
import { useHomeUserConfig } from '../home/home-user-config';
import { BadgeTone } from '@/components/ui/badge';
import { FinanceiroProvider } from '@/features/financeiro/application/context/financeiro-context';
import { FinanceiroCharts } from '../financeiro/ui/components/financeiro-charts';
import { DashboardUpcomingBills } from './financeiro/ui/components/dashboard-upcoming-bills';
import { DashboardRecentActivity } from './financeiro/ui/components/dashboard-recent-activity';
import { Wallet, Target, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetaProvider } from '@/features/meta/application/context/meta-context';
import { MetaSummary } from './meta/ui/components/meta-summary';

interface DashboardProps {
  tone?: BadgeTone;
}

function SectionHeading({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  children,
}: {
  icon: typeof Wallet;
  iconClassName: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight text-foreground">
            {title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Dashboard({}: DashboardProps) {
  const userConfig = useHomeUserConfig();
  const userName = userConfig.name;
  const [hideValues, setHideValues] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setHasMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
    };

    checkOverflow();
    el.addEventListener('scroll', checkOverflow);
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkOverflow);
      observer.disconnect();
    };
  }, []);

  const todayLabel = capitalize(
    new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  );

  return (
    <FinanceiroProvider>
      <MetaProvider>
        <PageContainer className="bg-background gap-6 pt-4 flex flex-col h-full overflow-hidden">
          <section className="px-1 shrink-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Olá, {userName}
            </h1>
            <p className="text-sm text-muted-foreground">{todayLabel}</p>
          </section>

          <div className="relative flex-1 min-h-0">
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto pr-1 flex flex-col gap-8 pb-10 custom-scrollbar"
            >
              <section className="flex flex-col gap-4 h-full">
                <SectionHeading
                  icon={Wallet}
                  iconClassName="bg-(--receita)/10 text-(--receita)"
                  title="Gestão financeira"
                  subtitle="Resumo de saldos e indicadores mensais"
                >
                  <button
                    type="button"
                    onClick={() => setHideValues((prev) => !prev)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {hideValues ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span className="hidden sm:inline">
                      {hideValues ? 'Mostrar valores' : 'Ocultar valores'}
                    </span>
                  </button>
                </SectionHeading>

                <div className="shrink-0">
                  <FinanceiroCharts hideValues={hideValues} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-4 flex-1 min-h-72 overflow-hidden">
                  <DashboardUpcomingBills hideValues={hideValues} />
                  <DashboardRecentActivity hideValues={hideValues} />
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  icon={Target}
                  iconClassName="bg-indigo-500/10 text-indigo-500"
                  title="Metas & objetivos"
                  subtitle="Acompanhamento de progresso e conquistas"
                />

                <MetaSummary />
              </section>
            </div>

            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-linear-to-t from-background to-transparent transition-opacity duration-300',
                hasMoreBelow ? 'opacity-100' : 'opacity-0',
              )}
            >
              <ChevronDown
                size={16}
                className="mb-1.5 text-muted-foreground/70 animate-bounce"
              />
            </div>
          </div>
        </PageContainer>
      </MetaProvider>
    </FinanceiroProvider>
  );
}
