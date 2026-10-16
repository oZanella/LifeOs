# Life OS

Painel pessoal para organizar a vida em um só lugar: finanças, metas e treinos.

## Módulos

- **Dashboard**: resumo financeiro do mês, contas a vencer, atividade recente e progresso das metas.
- **Financeiro**: receitas, despesas e investimentos, categorias e subcategorias, lançamentos fixos ou parcelados, seleção em lote e gráficos.
- **Metas**: metas com tarefas, destaque e progresso.
- **Treinos**: fichas de treino com exercícios e séries (repetições e carga).
- **Configurações**: perfil, avatar e gestão de usuários (ADM).

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS + componentes [shadcn/ui](https://ui.shadcn.com) (Radix)
- PostgreSQL via `pg`
- Recharts (gráficos), date-fns, react-hot-toast

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um `.env.local` apontando para um banco PostgreSQL:

   ```bash
   DATABASE_URL=postgres://usuario:senha@localhost:5432/lifeos
   ```

   `POSTGRES_URL` também é aceito, para uso com o Vercel Postgres.

3. Suba o servidor:

   ```bash
   npm run dev
   ```

As tabelas são criadas e atualizadas automaticamente na primeira requisição (`runMigrations` em `lib/db.ts`). Ao alterar o schema, aumente `SCHEMA_VERSION` no mesmo arquivo para a migration rodar de novo sem reiniciar o servidor.

## Estrutura

```
app/            páginas (/ e /login) e rotas da API (app/api/**)
features/       telas e estado de cada módulo (dashboard, financeiro, meta, treino, home)
components/ui/  componentes base (shadcn)
lib/            banco (db.ts, *-db.ts), autenticação, helpers da API, formatação
providers/      autenticação, tema e toasts
proxy.ts        redireciona para /login quando não há sessão
```

As rotas da API usam `withSession` (`lib/api.ts`), que valida a sessão e transforma erros em respostas JSON.
