'use client';

import { useState } from 'react';
import {
  useFinanceiroContext,
  Category,
} from '@/features/financeiro/application/context/financeiro-context';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ToneSelect } from '@/components/ui/tone-select';
import { AppBadgeTone, getToneLabel } from '@/lib/tone-options';

interface CategoryForm {
  name: string;
  tone: BadgeTone;
}

const INITIAL_FORM: CategoryForm = { name: '', tone: 'default' };

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

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, tone: cat.tone as BadgeTone });
  };

  const handleSaveEdit = async () => {
    if (editingId && editForm.name) {
      await updateCategory(editingId, {
        name: editForm.name || '',
        tone: editForm.tone,
      });
      setEditingId(null);
      setEditForm(INITIAL_FORM);
    }
  };

  const handleAdd = async () => {
    if (editForm.name) {
      await addCategory({
        name: editForm.name || '',
        tone: editForm.tone,
      });
      setIsAdding(false);
      setEditForm(INITIAL_FORM);
    }
  };

  const handleDeleteEditing = async () => {
    if (!editingId) {
      return;
    }

    await deleteCategory(editingId);
    setEditingId(null);
    setEditForm(INITIAL_FORM);
  };

  return (
    <Card
      data-tone={tone}
      className={cn(
        'border-border/40 bg-card/50 backdrop-blur-sm w-full',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
          Gerenciar Categorias
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 cursor-pointer"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus size={14} />
          <span>Nova</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mt-2 space-y-2">
          {isAdding && !editingId && (
            <div className="bg-muted/40 p-2 rounded-lg border border-border/40 animate-in fade-in slide-in-from-top-1">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                <Input
                  autoFocus
                  placeholder="Nome..."
                  className="h-8 text-xs w-full min-w-0 sm:col-span-3 bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[var(--tone-color)]"
                  value={editForm.name || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <ToneSelect
                  value={editForm.tone || 'default'}
                  onChange={(nextTone) =>
                    setEditForm({
                      ...editForm,
                      tone: nextTone,
                    })
                  }
                  className="w-full min-w-0 sm:col-span-2"
                />
              </div>
              <div className="flex gap-1 justify-end sm:justify-start">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-emerald-500 cursor-pointer"
                  onClick={() => void handleAdd()}
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
          )}
          {editingId && (
            <div className="bg-muted/40 p-2 rounded-lg border border-border/40 animate-in fade-in zoom-in-95">
              <div className="grid w-full grid-cols-1 sm:grid-cols-5 gap-2 min-w-0 items-center">
                <Input
                  className="h-8 text-xs w-full min-w-0 truncate sm:col-span-3 bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[var(--tone-color)]"
                  value={editForm.name || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  title={editForm.name || ''}
                />
                <ToneSelect
                  value={editForm.tone || 'default'}
                  onChange={(nextTone) =>
                    setEditForm({
                      ...editForm,
                      tone: nextTone,
                    })
                  }
                  className="w-full min-w-0 sm:col-span-2 [&>span]:truncate"
                />
              </div>
              <div className="mt-2 flex gap-1 justify-end sm:justify-start">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-emerald-500 cursor-pointer"
                  onClick={() => void handleSaveEdit()}
                >
                  <Check size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 cursor-pointer"
                  onClick={() => void handleDeleteEditing()}
                >
                  <Trash2 size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground cursor-pointer"
                  onClick={() => {
                    setEditingId(null);
                    setEditForm(INITIAL_FORM);
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="cursor-pointer"
                onClick={() => handleStartEdit(cat)}
                title={`Editar ${cat.name}`}
              >
                <Badge
                  tone={cat.tone as BadgeTone}
                  variant="subtle"
                  className="px-3 py-1 text-xs font-bold uppercase tracking-tight"
                  title={getToneLabel(cat.tone as AppBadgeTone)}
                >
                  {cat.name}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
