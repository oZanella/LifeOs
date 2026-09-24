import type { Category } from './context/financeiro-context';

export function getRootCategories(categories: Category[]) {
  return categories.filter((cat) => !cat.parentId);
}

export function getSubcategories(categories: Category[], parentId: string) {
  return categories.filter((cat) => cat.parentId === parentId);
}

/** Resolve o id vinculado ao lançamento em categoria pai + subcategoria (se houver). */
export function resolveCategory(categories: Category[], categoryId?: string | null) {
  const category = categories.find((cat) => cat.id === categoryId);
  if (!category) return { parent: undefined, sub: undefined };

  const parent = category.parentId
    ? categories.find((cat) => cat.id === category.parentId)
    : undefined;

  return parent
    ? { parent, sub: category }
    : { parent: category, sub: undefined };
}

export function getCategoryLabel(categories: Category[], categoryId?: string | null) {
  const { parent, sub } = resolveCategory(categories, categoryId);
  if (!parent) return undefined;
  return sub ? `${parent.name} › ${sub.name}` : parent.name;
}
