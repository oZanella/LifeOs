'use client';

import { useState } from 'react';
import { Check, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { badgeVariants, BadgeTone } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AppBadgeTone, TONE_OPTIONS } from '@/lib/tone-options';
import { cn } from '@/lib/utils';
import {
  Treino,
  useTreinoContext,
} from '@/features/treino/application/context/treino-context';

interface TreinoModalProps {
  treino: Treino | null;
  onClose: () => void;
  onCreated?: (treinoId: string) => void;
}

// Vivid tones only; the full palette is too long for a quick pick.
const COLOR_OPTIONS = TONE_OPTIONS.filter((option) => !option.group);

export function TreinoModal({ treino, onClose, onCreated }: TreinoModalProps) {
  const { addTreino, updateTreino, isProcessing } = useTreinoContext();
  const [title, setTitle] = useState(treino?.title ?? '');
  const [description, setDescription] = useState(treino?.description ?? '');
  const [tone, setTone] = useState<AppBadgeTone>(
    (treino?.tone as AppBadgeTone) || 'laranja',
  );

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const data = {
      title: trimmedTitle,
      description: description.trim() || null,
      tone,
    };

    try {
      if (treino) {
        await updateTreino(treino.id, data);
        onClose();
      } else {
        const createdId = await addTreino(data);
        onClose();
        if (createdId) onCreated?.(createdId);
      }
    } catch {
      // The context already shows the error toast; keep the modal open.
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>{treino ? 'Editar treino' : 'Novo treino'}</DialogTitle>
            <DialogDescription>
              {treino
                ? 'Altere o nome, a descrição ou a cor do treino.'
                : 'Depois de criar, você já cai direto no treino para adicionar os exercícios.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <div
              className={cn(
                badgeVariants({ tone: tone as BadgeTone, variant: 'subtle' }),
                'h-11 w-11 shrink-0 justify-center rounded-xl p-0 [&>svg]:size-5',
              )}
            >
              <Dumbbell />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">
                {title.trim() || 'Nome do treino'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {description.trim() || 'Descrição'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="treino-title"
              className="text-xs font-medium text-muted-foreground"
            >
              Nome
            </Label>
            <Input
              id="treino-title"
              autoFocus
              placeholder="Ex: Treino A – Peito e Tríceps"
              className="h-10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="treino-description"
              className="text-xs font-medium text-muted-foreground"
            >
              Descrição (opcional)
            </Label>
            <Input
              id="treino-description"
              placeholder="Ex: Segunda e quinta · foco em hipertrofia"
              className="h-10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Cor
            </Label>
            <div className="grid grid-cols-10 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  onClick={() => setTone(option.value)}
                  className={cn(
                    'flex aspect-square w-full items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110',
                    option.dotClassName,
                    tone === option.value &&
                      'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                  )}
                >
                  {tone === option.value && (
                    <Check size={14} className="text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !title.trim()}
              className="cursor-pointer"
            >
              {isProcessing
                ? 'Salvando...'
                : treino
                  ? 'Salvar alterações'
                  : 'Criar treino'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
