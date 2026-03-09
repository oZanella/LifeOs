'use client';

import { useState } from 'react';
import {
  useFinanceiroContext,
  Category,
} from '@/features/financeiro/application/context/financeiro-context';

import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}: {
  tone?: BadgeTone;
  className?: string;
}) {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useFinanceiroContext();

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

  async function saveEdit() {
    if (!editingId || !editForm.name.trim()) return;

    await updateCategory(editingId, editForm);

    cancelEdit();
  }

  async function add() {
    if (!editForm.name.trim()) return;

    await addCategory(editForm);

    setIsAdding(false);
    setEditForm(INITIAL_FORM);
  }

  async function remove() {
    if (!editingId) return;

    await deleteCategory(editingId);

    cancelEdit();
  }

  return (
    <Card
      data-tone={tone}
      className={cn(
        'border-border/40 bg-card/50 backdrop-blur-sm w-full',
        className,
      )}
    >
      <CardHeader className="flex items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
          Categorias
        </CardTitle>

        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1"
          disabled={isAdding}
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
        >
          <Plus size={14} />
          Nova
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
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
                  className="h-7 w-7 text-emerald-500"
                  onClick={() => void add()}
                >
                  <Check size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500"
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
                  onClick={() => void saveEdit()}
                >
                  <Check size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 cursor-pointer"
                  onClick={() => void remove()}
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
        <p className="text-xs text-muted-foreground sm:hidden">
          Selecione uma categoria para editar
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
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
      </CardContent>
    </Card>
  );
}
