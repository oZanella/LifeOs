'use client';

import { useState } from 'react';
import {
  useFinanceiroContext,
  Category,
} from '@/features/financeiro/application/context/financeiro-context';

import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ToneSelect } from '@/components/ui/tone-select';

interface CategoryForm {
  name: string;
  tone: BadgeTone;
}

const INITIAL_FORM: CategoryForm = {
  name: '',
  tone: 'default',
};

export function FinanceiroCategories({
  tone = 'success',
  className,
  onApplyAction: onApply,
  onCancelAction: onCancel,
}: {
  tone?: BadgeTone;
  className?: string;
  onApplyAction?: () => void;
  onCancelAction?: () => void;
}) {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useFinanceiroContext();

  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!hasInitialized && categories.length > 0) {
    setLocalCategories([...categories]);
    setHasInitialized(true);
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(INITIAL_FORM);
  const [isAdding, setIsAdding] = useState(false);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      tone: cat.tone as BadgeTone,
    });
    setIsAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(INITIAL_FORM);
  }

  function saveEdit() {
    if (!editingId || !editForm.name.trim()) return;

    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === editingId
          ? { ...cat, name: editForm.name, tone: editForm.tone }
          : cat,
      ),
    );

    cancelEdit();
  }

  function add() {
    if (!editForm.name.trim()) return;

    const newCat: Category = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: editForm.name,
      tone: editForm.tone,
    };

    setLocalCategories((prev) => [...prev, newCat]);
    setIsAdding(false);
    setEditForm(INITIAL_FORM);
  }

  function remove() {
    if (!editingId) return;

    if (!editingId.startsWith('temp-')) {
      setDeletedIds((prev) => [...prev, editingId]);
    }

    setLocalCategories((prev) => prev.filter((cat) => cat.id !== editingId));
    cancelEdit();
  }

  async function handleApply() {
    // 1. Validate
    const names = localCategories.map((c) => c.name.toLowerCase().trim());
    const hasDuplicates = names.some(
      (name, index) => names.indexOf(name) !== index,
    );

    if (hasDuplicates) {
      alert('Existem categorias com nomes duplicados.');
      return;
    }

    setIsSyncing(true);
    try {
      for (const id of deletedIds) {
        await deleteCategory(id);
      }

      for (const local of localCategories) {
        const original = categories.find((c) => c.id === local.id);

        if (local.id.startsWith('temp-')) {
          await addCategory({
            name: local.name,
            tone: local.tone as BadgeTone,
          });
        } else if (
          original &&
          (original.name !== local.name || original.tone !== local.tone)
        ) {
          await updateCategory(local.id, {
            name: local.name,
            tone: local.tone as BadgeTone,
          });
        }
      }

      onApply?.();
    } catch (error) {
      console.error('Erro ao sincronizar categorias:', error);
      alert('Erro ao salvar categorias. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className={cn('space-y-4', className)} data-tone={tone}>
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Gerenciar Categorias
        </h4>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] uppercase font-bold tracking-wider gap-1.5 cursor-pointer"
          disabled={isAdding || isSyncing}
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
        >
          <Plus size={12} />
          Nova
        </Button>
      </div>

      <div className="space-y-3">
        {isAdding && (
          <div className="rounded-lg border border-border/40 bg-muted/40 p-3 space-y-3 animate-in fade-in">
            <Input
              autoFocus
              placeholder="Nome da categoria"
              className="h-8 text-xs"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <ToneSelect
                value={editForm.tone ?? 'default'}
                onChange={(tone) =>
                  setEditForm({
                    ...editForm,
                    tone,
                  })
                }
              />

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-emerald-500 cursor-pointer"
                  onClick={() => add()}
                >
                  <Check size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 cursor-pointer"
                  onClick={() => setIsAdding(false)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {editingId && (
          <div className="rounded-lg border border-border/40 bg-muted/40 p-3 space-y-3 animate-in zoom-in-95">
            <Input
              autoFocus
              className="h-8 text-xs"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <ToneSelect
                value={editForm.tone ?? 'default'}
                onChange={(tone) =>
                  setEditForm({
                    ...editForm,
                    tone,
                  })
                }
              />

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-emerald-500 cursor-pointer"
                  onClick={() => saveEdit()}
                >
                  <Check size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 cursor-pointer"
                  onClick={() => remove()}
                >
                  <Trash2 size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer"
                  onClick={cancelEdit}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {localCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => startEdit(cat)}
              className="group relative cursor-pointer"
            >
              <Badge
                tone={cat.tone as BadgeTone}
                variant="subtle"
                className="px-3 py-1 text-xs font-semibold uppercase tracking-tight transition-all group-hover:opacity-80"
              >
                {cat.name}
              </Badge>

              <Pencil
                size={10}
                className="absolute -top-1 -right-1 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/20 flex flex-col sm:flex-row gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto px-6 cursor-pointer"
          disabled={isSyncing}
          onClick={onCancel}
        >
          Voltar
        </Button>
        <Button
          size="sm"
          className="w-full sm:w-auto px-8 cursor-pointer font-bold"
          disabled={isSyncing}
          onClick={() => void handleApply()}
        >
          {isSyncing ? 'Aplicando...' : 'Aplicar'}
        </Button>
      </div>
    </div>
  );
}
