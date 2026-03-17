'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Meta,
  useMetaContext,
} from '@/features/meta/application/context/meta-context';
import { cn } from '@/lib/utils';
import { BadgeTone } from '@/components/ui/badge';

interface MetaModalProps {
  meta?: Partial<Meta> | null;
  onClose: () => void;
}

const TONES: { label: string; value: BadgeTone }[] = [
  { label: 'Tarefa', value: 'primary' },
  { label: 'Aviso', value: 'warning' },
  { label: 'Conquista', value: 'success' },
  { label: 'Informação', value: 'info' },
  { label: 'Urgente', value: 'error' },
];

export function MetaModal({ meta, onClose }: MetaModalProps) {
  const { addMeta, updateMeta, isProcessing } = useMetaContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<BadgeTone>('warning');

  useEffect(() => {
    if (meta) {
      const { title: t = '', description: d = '', tone: to = 'warning' } = meta;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(t);

      setDescription(d || '');

      setTone((to as BadgeTone) || 'warning');
    }
  }, [meta]);

  const handleSave = async () => {
    if (!title) return;

    if (meta?.id) {
      await updateMeta(meta.id, {
        title,
        description: description || null,
        tone: (tone as string) || 'warning',
      });
    } else {
      await addMeta({
        title,
        description: description || undefined,
        tone: (tone as string) || 'warning',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">
              {meta?.id ? 'Editar Meta' : 'Nova Meta'}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Ler 12 livros"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Um livro por mês em 2024"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer',
                      tone === t.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:border-border',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing || !title}
              className="cursor-pointer"
            >
              {isProcessing ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
