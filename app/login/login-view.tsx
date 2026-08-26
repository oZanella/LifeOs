'use client';

import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-3 py-6 sm:px-6">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:max-w-4xl">
        <div className="flex flex-col md:grid md:grid-cols-2">
          <aside className="hidden flex-col justify-between bg-foreground p-10 text-background md:flex">
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Life<span className="text-background/60">OS</span>
              </p>
              <h1 className="mt-8 text-2xl font-semibold leading-snug">
                Controle pessoal
                <br />
                em um só lugar
              </h1>
              <p className="mt-3 text-sm text-background/70">
                Organize financeiro, metas e rotina com acesso seguro.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-background/70">
                <ShieldCheck size={16} />
                Acesso protegido por sessão
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <UserRound size={16} />
                Dados separados por usuário
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 md:hidden">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Life<span className="text-muted-foreground">OS</span>
              </p>
            </div>

            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as 'login' | 'register');
                setError('');
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="login" className="cursor-pointer">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="cursor-pointer">
                  Criar conta
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-6">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {isRegister ? 'Criar conta' : 'Entrar'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRegister
                  ? 'Use nome de usuario, email e senha para criar seu acesso.'
                  : 'Informe seu email e senha para acessar o sistema.'}
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-3.5" key={mode}>
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
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="min-h-4">
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full cursor-pointer text-sm font-medium"
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
