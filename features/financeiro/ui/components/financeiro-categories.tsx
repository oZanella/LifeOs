'use client';

import { useState } from 'react';
import {
  useFinanceiroContext,
  Category,
} from '@/features/financeiro/application/context/financeiro-context';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryForm {
  name: string;
  tone: BadgeTone;
}

const INITIAL_FORM: CategoryForm = { name: '', tone: 'default' };

export function FinanceiroCategories({
  tone = 'success',
}: {
  tone?: BadgeTone;
}) {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useFinanceiroContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(INITIAL_FORM);
  const [isAdding, setIsAdding] = useState(false);

  console.log('Categories tone:', tone);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, tone: cat.tone as BadgeTone });
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.name) {
      updateCategory(editingId, {
        name: editForm.name || '',
        tone: (editForm.tone as string) || 'default',
      });
      setEditingId(null);
      setEditForm(INITIAL_FORM);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(INITIAL_FORM);
  };

  const handleAdd = () => {
    if (editForm.name) {
      addCategory({
        name: editForm.name || '',
        tone: (editForm.tone as string) || 'default',
      });
      setIsAdding(false);
      setEditForm(INITIAL_FORM);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditForm(INITIAL_FORM);
  };

  const tones: BadgeTone[] = [
    'default',
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
    'accent',
    'gold',
  ];

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm mb-6">
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
        <div className="flex flex-wrap gap-2 mt-2">
          {isAdding && (
            <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border/40 w-full sm:w-auto animate-in fade-in slide-in-from-top-1">
              <Input
                autoFocus
                placeholder="Nome..."
                className="h-8 text-xs w-full sm:w-32 bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color)"
                value={editForm.name || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              <Select
                value={editForm.tone || 'default'}
                onValueChange={(v) =>
                  setEditForm({
                    ...editForm,
                    tone: v as BadgeTone,
                  })
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs bg-background border-border/40 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem
                      key={String(t || 'default')}
                      value={String(t || 'default')}
                      className="cursor-pointer text-xs"
                    >
                      {String(t || 'default')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-emerald-500 cursor-pointer"
                  onClick={handleAdd}
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

          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border/40 animate-in fade-in zoom-in-95"
                >
                  <Input
                    className="h-8 text-xs w-32 bg-background border-border/40 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-(--tone-color)"
                    value={editForm.name || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <Select
                    value={editForm.tone || 'default'}
                    onValueChange={(v) =>
                      setEditForm({
                        ...editForm,
                        tone: v as BadgeTone,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-24 text-xs bg-background border-border/40 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem
                          key={String(t || 'default')}
                          value={String(t || 'default')}
                          className="cursor-pointer text-xs"
                        >
                          {String(t || 'default')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-emerald-500 cursor-pointer"
                      onClick={handleSaveEdit}
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 cursor-pointer"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cat.id}
                className="group relative flex items-center gap-1"
              >
                <Badge
                  tone={cat.tone as BadgeTone}
                  variant="subtle"
                  className="px-3 py-1 text-xs font-bold uppercase tracking-tight"
                >
                  {cat.name}
                </Badge>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => handleStartEdit(cat)}
                  >
                    <Edit2 size={10} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-red-500 cursor-pointer"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    <Trash2 size={10} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
