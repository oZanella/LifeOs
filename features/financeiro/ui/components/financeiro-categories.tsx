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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FinanceiroConfirmDeleteModal } from './financeiro-confirm-delete-modal';

interface CategoryForm {
  name: string;
  tone: BadgeTone;
  parentId: string | null;
}

const INITIAL_FORM: CategoryForm = {
  name: '',
  tone: 'default',
  parentId: null,
};

const NO_PARENT_VALUE = 'none';

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
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const topLevelCategories = localCategories.filter((cat) => !cat.parentId);
  const getChildren = (parentId: string) =>
    localCategories.filter((cat) => cat.parentId === parentId);

  // Only already-saved categories can become a parent, since a brand-new
  // (temp-) category has no real id yet for the subcategory to point to.
  const parentOptions = topLevelCategories.filter(
    (cat) => !cat.id.startsWith('temp-') && cat.id !== editingId,
  );

  const editingCategoryHasChildren = editingId
    ? getChildren(editingId).length > 0
    : false;
  const canPickParent = isAdding || !editingCategoryHasChildren;

  function startAdd(parentId: string | null = null) {
    setEditingId(null);
    setEditForm({ ...INITIAL_FORM, parentId });
    setIsAdding(true);
  }

  function startEdit(cat: Category) {
    setIsAdding(false);
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      tone: cat.tone as BadgeTone,
      parentId: cat.parentId,
    });
  }

  function cancelForm() {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(INITIAL_FORM);
  }

  function saveEdit() {
    if (!editingId || !editForm.name.trim()) return;

    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === editingId
          ? {
              ...cat,
              name: editForm.name.trim(),
              tone: editForm.tone,
              parentId: editForm.parentId,
            }
          : cat,
      ),
    );

    cancelForm();
  }

  function add() {
    if (!editForm.name.trim()) return;

    const newCat: Category = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      name: editForm.name.trim(),
      tone: editForm.tone,
      parentId: editForm.parentId,
    };

    setLocalCategories((prev) => [...prev, newCat]);
    cancelForm();
  }

  function confirmRemove() {
    if (!editingId) return;

    if (!editingId.startsWith('temp-')) {
      setDeletedIds((prev) => [...prev, editingId]);
    }

    setLocalCategories((prev) =>
      prev
        .filter((cat) => cat.id !== editingId)
        .map((cat) =>
          cat.parentId === editingId ? { ...cat, parentId: null } : cat,
        ),
    );

    setIsConfirmDeleteOpen(false);
    cancelForm();
  }

  async function handleApply() {
    const siblingGroups = new Map<string, string[]>();
    localCategories.forEach((cat) => {
      const key = cat.parentId ?? 'root';
      const names = siblingGroups.get(key) ?? [];
      names.push(cat.name.toLowerCase().trim());
      siblingGroups.set(key, names);
    });

    const hasDuplicates = Array.from(siblingGroups.values()).some((names) =>
      names.some((name, index) => names.indexOf(name) !== index),
    );

    if (hasDuplicates) {
      alert('Existem categorias com o mesmo nome no mesmo nível.');
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
            parentId: local.parentId,
          });
        } else if (
          original &&
          (original.name !== local.name ||
            original.tone !== local.tone ||
            (original.parentId ?? null) !== (local.parentId ?? null))
        ) {
          await updateCategory(local.id, {
            name: local.name,
            tone: local.tone as BadgeTone,
            parentId: local.parentId,
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

  const parentBeingAddedTo = editForm.parentId
    ? localCategories.find((cat) => cat.id === editForm.parentId)
    : null;

  return (
    <div className={cn('space-y-4', className)} data-tone={tone}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          Gerenciar categorias
        </h4>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 cursor-pointer"
          disabled={isAdding || isSyncing}
          onClick={() => startAdd(null)}
        >
          <Plus size={12} />
          Nova categoria
        </Button>
      </div>

      <div className="space-y-3">
        {(isAdding || editingId) && (
          <div className="rounded-lg border border-border/40 bg-muted/40 p-3 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {isAdding
                  ? parentBeingAddedTo
                    ? `Nova subcategoria de "${parentBeingAddedTo.name}"`
                    : 'Nova categoria'
                  : 'Editar categoria'}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 cursor-pointer"
                onClick={cancelForm}
              >
                <X size={13} />
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Nome
              </label>
              <Input
                autoFocus
                placeholder="Nome da categoria"
                className="h-8 text-xs"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div className="flex items-end gap-2 flex-wrap">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Cor
                </label>
                <ToneSelect
                  value={editForm.tone ?? 'default'}
                  onChange={(tone) =>
                    setEditForm({
                      ...editForm,
                      tone,
                    })
                  }
                />
              </div>

              {canPickParent && (
                <div className="space-y-1 flex-1 min-w-40">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Categoria pai
                  </label>
                  <Select
                    value={editForm.parentId ?? NO_PARENT_VALUE}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        parentId: value === NO_PARENT_VALUE ? null : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-xs cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={NO_PARENT_VALUE}
                        className="cursor-pointer text-xs"
                      >
                        Nenhuma (categoria principal)
                      </SelectItem>
                      {parentOptions.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.id}
                          className="cursor-pointer text-xs"
                        >
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!canPickParent && (
              <p className="text-[11px] text-muted-foreground">
                Esta categoria possui subcategorias e por isso não pode virar
                uma subcategoria.
              </p>
            )}

            <div className="flex items-center justify-end gap-1 pt-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-emerald-500 cursor-pointer"
                onClick={isAdding ? add : saveEdit}
              >
                <Check size={14} />
              </Button>

              {!isAdding && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 cursor-pointer"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          {topLevelCategories.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              Nenhuma categoria cadastrada ainda.
            </p>
          )}

          {topLevelCategories.map((cat) => {
            const children = getChildren(cat.id);

            return (
              <div
                key={cat.id}
                className="rounded-lg border border-border/30 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="group relative cursor-pointer"
                  >
                    <Badge
                      tone={cat.tone as BadgeTone}
                      variant="subtle"
                      className="px-3 py-1 text-xs font-medium transition-all group-hover:opacity-80"
                    >
                      {cat.name}
                    </Badge>
                    <Pencil
                      size={10}
                      className="absolute -top-1 -right-1 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                    />
                  </button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0 text-muted-foreground cursor-pointer"
                    title="Adicionar subcategoria"
                    disabled={isAdding || isSyncing}
                    onClick={() => startAdd(cat.id)}
                  >
                    <Plus size={13} />
                  </Button>
                </div>

                {children.length > 0 && (
                  <div className="mt-2.5 ml-2.5 pl-3 border-l-2 border-border/30 flex flex-wrap gap-1.5">
                    {children.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => startEdit(sub)}
                        className="group relative cursor-pointer"
                      >
                        <Badge
                          tone={sub.tone as BadgeTone}
                          variant="subtle"
                          className="px-2.5 py-0.5 text-[11px] font-medium transition-all group-hover:opacity-80"
                        >
                          {sub.name}
                        </Badge>
                        <Pencil
                          size={9}
                          className="absolute -top-1 -right-1 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FinanceiroConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmRemove}
        title="Excluir categoria"
        description={
          editingCategoryHasChildren
            ? `Tem certeza que deseja excluir "${editForm.name}"? As subcategorias dela deixarão de ter uma categoria pai.`
            : `Tem certeza que deseja excluir "${editForm.name}"?`
        }
      />

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
