'use client';

import { useCallback, useRef, useState } from 'react';
import {
  useFinanceiroContext,
  Category,
} from '@/features/financeiro/application/context/financeiro-context';

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge, BadgeTone } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  AppBadgeTone,
  CATEGORY_TONE_OPTIONS,
  TONE_DOT_CLASSNAME,
  TONE_GROUPS,
  getToneLabel,
} from '@/lib/tone-options';
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

  const [scrollHints, setScrollHints] = useState({ up: false, down: false });
  const listElRef = useRef<HTMLDivElement | null>(null);
  const listObserverRef = useRef<ResizeObserver | null>(null);

  const updateScrollHints = useCallback((el: HTMLElement) => {
    const up = el.scrollTop > 2;
    const down = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setScrollHints((prev) =>
      prev.up === up && prev.down === down ? prev : { up, down },
    );
  }, []);

  // The list unmounts while the form is open, so a callback ref keeps the
  // observer attached to whichever list element is currently mounted.
  const listRef = useCallback(
    (el: HTMLDivElement | null) => {
      listObserverRef.current?.disconnect();
      listObserverRef.current = null;
      listElRef.current = el;
      if (!el) return;

      const observer = new ResizeObserver(() => updateScrollHints(el));
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
      listObserverRef.current = observer;
    },
    [updateScrollHints],
  );

  function scrollList(direction: 1 | -1) {
    const el = listElRef.current;
    if (!el) return;
    el.scrollBy({ top: direction * el.clientHeight * 0.7, behavior: 'smooth' });
  }

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

  const isFormOpen = isAdding || editingId !== null;
  const canSubmit = editForm.name.trim().length > 0;

  const isChanged = (cat: Category) => {
    if (cat.id.startsWith('temp-')) return true;
    const original = categories.find((c) => c.id === cat.id);
    return (
      !!original &&
      (original.name !== cat.name ||
        original.tone !== cat.tone ||
        (original.parentId ?? null) !== (cat.parentId ?? null))
    );
  };
  const pendingCount =
    deletedIds.length + localCategories.filter(isChanged).length;

  function submitForm() {
    if (isAdding) add();
    else saveEdit();
  }

  const formTitle = isAdding
    ? parentBeingAddedTo
      ? `Nova subcategoria em ${parentBeingAddedTo.name}`
      : 'Nova categoria'
    : localCategories.find((cat) => cat.id === editingId)?.parentId
      ? 'Editar subcategoria'
      : 'Editar categoria';

  function renderStatus(cat: Category) {
    if (cat.id.startsWith('temp-')) {
      return (
        <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
          nova
        </span>
      );
    }
    if (isChanged(cat)) {
      return (
        <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
          editada
        </span>
      );
    }
    return null;
  }

  return (
    <div
      className={cn('flex min-w-0 flex-col gap-4', className)}
      data-tone={tone}
    >
      {isFormOpen ? (
        <form
          className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 cursor-pointer"
              title="Voltar para a lista"
              onClick={cancelForm}
            >
              <ArrowLeft size={16} />
            </Button>
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">
              {formTitle}
            </span>
          </div>

          <div className="flex min-h-14 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3">
            <Badge
              tone={editForm.tone}
              variant="subtle"
              className="max-w-full truncate px-3 py-1 text-xs font-medium"
            >
              {editForm.name.trim() || 'Pré-visualização'}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="category-name"
              className="text-xs font-medium text-muted-foreground"
            >
              Nome
            </Label>
            <Input
              id="category-name"
              autoFocus
              placeholder="Ex.: Mercado"
              className="h-9 text-sm"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Cor
              <span className="font-normal text-foreground/70">
                · {getToneLabel(editForm.tone ?? 'default')}
              </span>
            </Label>
            <div className="flex flex-col gap-3">
              {TONE_GROUPS.map((group) => (
                <div key={group.value} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                    {group.label}
                  </span>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(1.75rem,1fr))] justify-items-center gap-2.5">
                    {CATEGORY_TONE_OPTIONS.filter(
                      (option) => (option.group ?? 'vivas') === group.value,
                    ).map((option) => {
                      const selected =
                        (editForm.tone ?? 'default') === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          title={option.label}
                          aria-label={option.label}
                          aria-pressed={selected}
                          onClick={() =>
                            setEditForm({ ...editForm, tone: option.value })
                          }
                          className={cn(
                            'flex size-7 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-background transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            option.dotClassName,
                            selected && 'ring-2 ring-foreground',
                          )}
                        >
                          {selected && (
                            <Check
                              size={13}
                              className={
                                option.group === 'pastel'
                                  ? 'text-zinc-900'
                                  : 'text-white'
                              }
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canPickParent ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Categoria pai
              </Label>
              <Select
                value={editForm.parentId ?? NO_PARENT_VALUE}
                onValueChange={(value) =>
                  setEditForm({
                    ...editForm,
                    parentId: value === NO_PARENT_VALUE ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-9 w-full cursor-pointer text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={NO_PARENT_VALUE}
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    Nenhuma (categoria principal)
                  </SelectItem>
                  {parentOptions.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id}
                      className="cursor-pointer text-sm"
                    >
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Esta categoria possui subcategorias e por isso não pode virar uma
              subcategoria.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border/20 pt-4 sm:flex-row sm:items-center">
            {!isAdding && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer gap-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-500 sm:mr-auto"
                onClick={() => setIsConfirmDeleteOpen(true)}
              >
                <Trash2 size={14} />
                Excluir
              </Button>
            )}
            <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer px-5"
                onClick={cancelForm}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer px-6 font-semibold"
                disabled={!canSubmit}
              >
                {isAdding ? 'Adicionar' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {topLevelCategories.length}{' '}
              {topLevelCategories.length === 1 ? 'categoria' : 'categorias'}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs"
              disabled={isSyncing}
              onClick={() => startAdd(null)}
            >
              <Plus size={14} />
              Nova categoria
            </Button>
          </div>

          <div className="relative">
            <div
              ref={listRef}
              onScroll={(e) => updateScrollHints(e.currentTarget)}
              className="no-scrollbar max-h-[50vh] overflow-y-auto overscroll-contain rounded-lg border border-border/40"
            >
              {topLevelCategories.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Tags size={22} className="text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria cadastrada ainda.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border/30">
                  {topLevelCategories.map((cat) => {
                    const children = getChildren(cat.id);

                    return (
                      <li key={cat.id}>
                        <div className="flex items-center gap-1 py-1 pr-1.5 pl-1 transition-colors hover:bg-muted/30">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left"
                          >
                            <span
                              className={cn(
                                'size-2.5 shrink-0 rounded-full',
                                TONE_DOT_CLASSNAME[cat.tone as AppBadgeTone] ??
                                  TONE_DOT_CLASSNAME.default,
                              )}
                            />
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium text-foreground">
                                {cat.name}
                              </span>
                              {children.length > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  {children.length}{' '}
                                  {children.length === 1
                                    ? 'subcategoria'
                                    : 'subcategorias'}
                                </span>
                              )}
                            </span>
                            {renderStatus(cat)}
                          </button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Adicionar subcategoria"
                            disabled={isSyncing}
                            onClick={() => startAdd(cat.id)}
                          >
                            <Plus size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Editar categoria"
                            disabled={isSyncing}
                            onClick={() => startEdit(cat)}
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>

                        {children.length > 0 && (
                          <ul className="pb-1.5">
                            {children.map((sub) => (
                              <li
                                key={sub.id}
                                className="flex items-center gap-1 pr-1.5 pl-5 transition-colors hover:bg-muted/30"
                              >
                                <CornerDownRight
                                  size={13}
                                  className="shrink-0 text-muted-foreground/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => startEdit(sub)}
                                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left"
                                >
                                  <span
                                    className={cn(
                                      'size-2 shrink-0 rounded-full',
                                      TONE_DOT_CLASSNAME[
                                        sub.tone as AppBadgeTone
                                      ] ?? TONE_DOT_CLASSNAME.default,
                                    )}
                                  />
                                  <span className="truncate text-[13px] text-muted-foreground">
                                    {sub.name}
                                  </span>
                                  {renderStatus(sub)}
                                </button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                  title="Editar subcategoria"
                                  disabled={isSyncing}
                                  onClick={() => startEdit(sub)}
                                >
                                  <Pencil size={13} />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {scrollHints.up && (
              <div className="pointer-events-none absolute inset-x-px top-px flex h-10 items-start justify-center rounded-t-lg bg-linear-to-b from-background via-background/80 to-transparent">
                <button
                  type="button"
                  aria-label="Rolar para cima"
                  onClick={() => scrollList(-1)}
                  className="pointer-events-auto cursor-pointer rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            )}

            {scrollHints.down && (
              <div className="pointer-events-none absolute inset-x-px bottom-px flex h-12 items-end justify-center rounded-b-lg bg-linear-to-t from-background via-background/80 to-transparent pb-1">
                <button
                  type="button"
                  aria-label="Rolar para baixo"
                  onClick={() => scrollList(1)}
                  className="pointer-events-auto cursor-pointer animate-bounce rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/20 pt-4 sm:flex-row sm:items-center">
            {pendingCount > 0 && (
              <span className="text-center text-xs text-amber-500 sm:mr-auto sm:text-left">
                {pendingCount}{' '}
                {pendingCount === 1
                  ? 'alteração não aplicada'
                  : 'alterações não aplicadas'}
              </span>
            )}
            <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer px-6"
                disabled={isSyncing}
                onClick={onCancel}
              >
                Voltar
              </Button>
              <Button
                size="sm"
                className="cursor-pointer px-8 font-semibold"
                disabled={isSyncing}
                onClick={() => void handleApply()}
              >
                {isSyncing ? 'Aplicando...' : 'Aplicar'}
              </Button>
            </div>
          </div>
        </>
      )}

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
    </div>
  );
}
