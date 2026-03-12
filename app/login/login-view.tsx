'use client';

import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider/auth.provider';

export function LoginView() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ email, username, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-background flex items-center justify-center px-3 py-4 sm:px-6 sm:py-6 overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

      <section className="relative z-10 w-full max-w-md md:w-240 md:max-w-240 mx-auto overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 bg-card/90 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:grid md:grid-cols-2">
          <div className="md:hidden px-4 py-5 bg-primary text-primary-foreground">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/75">
              Life OS
            </p>
            <p className="mt-1 text-sm font-semibold leading-tight">
              Controle pessoal em um só lugar
            </p>
          </div>

          <aside className="hidden md:flex flex-col justify-between p-8 bg-linear-to-br from-primary via-primary/90 to-secondary text-primary-foreground">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                Life OS
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight">
                Controle pessoal
                <br />
                em um só lugar
              </h1>
              <p className="mt-4 text-sm text-primary-foreground/85">
                Organize financeiro, tarefas, metas e rotina com acesso seguro.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/85">
                <ShieldCheck size={16} />
                Acesso protegido por sessão
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/85">
                <UserRound size={16} />
                Dados separados por usuário
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-7 md:p-9">
            <div className="grid grid-cols-2 rounded-xl border border-border/50 bg-muted/30 p-1 sm:p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`h-11 sm:h-10 rounded-lg text-sm sm:text-sm font-semibold transition-colors cursor-pointer ${
                  !isRegister
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`h-11 sm:h-10 rounded-lg text-sm sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isRegister
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Criar conta
              </button>
            </div>

            <div className="mt-6 min-h-90 sm:min-h-105">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isRegister ? 'Criar conta' : 'Entrar'}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {isRegister
                  ? 'Use nome de usuario, email e senha para criar seu acesso.'
                  : 'Informe seu email e senha para acessar o sistema.'}
              </p>

              <form
                onSubmit={onSubmit}
                className="mt-5 sm:mt-5 space-y-3.5"
                key={mode}
              >
                {isRegister && (
                  <Input
                    placeholder="Nome de usuario"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={3}
                    required
                    className="h-11"
                  />
                )}

                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11"
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    className="pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="h-4">
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-10 cursor-pointer text-sm font-semibold"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Enviando...'
                    : isRegister
                      ? 'Criar conta'
                      : 'Entrar'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
