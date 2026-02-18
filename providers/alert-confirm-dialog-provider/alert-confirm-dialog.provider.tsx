'use client';

import { createContext, useState, type ReactNode } from 'react';

type AlertDialogContextType = {
  closeAlertDialog: () => void;
};

export const AlertConfirmDialogContext =
  createContext<AlertDialogContextType | null>(null);

export function AlertConfirmDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [] = useState({
    title: '',
    description: undefined,
    descriptionNode: undefined,
    confirmLabel: undefined,
    cancelLabel: undefined,
    hideCancel: undefined,
    loading: undefined,
    loadingText: undefined,
    classNameConfirm: undefined,
    onConfirm: () => {},
    onCancel: () => {},
    open: false,
  });

  return { children };
}
