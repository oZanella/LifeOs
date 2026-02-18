'use client';

import { cva } from 'class-variance-authority';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import React, { createContext, useMemo } from 'react';
import toast from 'react-hot-toast';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export interface ShowToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  showProgressBar?: boolean;
  autoClose?: boolean;
}

export interface ShowToastParams {
  title: string;
  description?: string;
  severity?: ToastSeverity;
  options?: ShowToastOptions;
}

export type ShowToastProps = (params: ShowToastParams) => void;

interface ToastContextActions {
  showToast: ShowToastProps;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextActions | undefined>(
  undefined,
);

/* ================= Variants ================= */
const toastVariants = cva(
  'relative max-w-md w-full rounded-md shadow-md border overflow-hidden transition-all duration-300 ease-out',
  {
    variants: {
      severity: {
        success:
          'bg-emerald-50 dark:bg-emerald-950 border-emerald-200/50 dark:border-emerald-800/50',
        error:
          'bg-rose-50 dark:bg-rose-950 border-rose-200/50 dark:border-rose-800/50',
        info: 'bg-blue-50 dark:bg-blue-950 border-blue-200/50 dark:border-blue-800/50',
        warning:
          'bg-amber-50 dark:bg-amber-950 border-amber-200/50 dark:border-amber-800/50',
      },
    },
    defaultVariants: { severity: 'info' },
  },
);

const iconVariants = cva(
  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
  {
    variants: {
      severity: {
        success: 'bg-linear-to-br from-emerald-400 to-green-500 text-white',
        error: 'bg-linear-to-br from-rose-400 to-red-500 text-white',
        info: 'bg-linear-to-br from-blue-400 to-cyan-500 text-white',
        warning: 'bg-linear-to-br from-amber-400 to-orange-500 text-white',
      },
    },
    defaultVariants: { severity: 'info' },
  },
);

const textVariants = cva('font-semibold text-sm mb-1 leading-tight', {
  variants: {
    severity: {
      success: 'text-emerald-900 dark:text-emerald-100',
      error: 'text-rose-900 dark:text-rose-100',
      info: 'text-blue-900 dark:text-blue-100',
      warning: 'text-amber-900 dark:text-amber-100',
    },
  },
  defaultVariants: { severity: 'info' },
});

const subTextVariants = cva('text-sm leading-relaxed', {
  variants: {
    severity: {
      success: 'text-emerald-700 dark:text-emerald-200',
      error: 'text-rose-700 dark:text-rose-200',
      info: 'text-blue-700 dark:text-blue-200',
      warning: 'text-amber-700 dark:text-amber-200',
    },
  },
  defaultVariants: { severity: 'info' },
});

const closeButtonVariants = cva(
  'shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-out group',
  {
    variants: {
      severity: {
        success:
          'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:text-emerald-100 dark:hover:bg-emerald-800/30',
        error:
          'text-rose-600 hover:text-rose-800 hover:bg-rose-100 dark:text-rose-300 dark:hover:text-rose-100 dark:hover:bg-rose-800/30',
        info: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-100 dark:hover:bg-blue-800/30',
        warning:
          'text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-800/30',
      },
    },
    defaultVariants: { severity: 'info' },
  },
);

const progressBarVariants = cva('h-full', {
  variants: {
    severity: {
      success: 'bg-linear-to-r from-emerald-500 to-green-600',
      error: 'bg-linear-to-r from-rose-500 to-red-600',
      info: 'bg-linear-to-r from-blue-500 to-cyan-600',
      warning: 'bg-linear-to-r from-amber-500 to-orange-600',
    },
  },
  defaultVariants: { severity: 'info' },
});

const getIcon = (severity: ToastSeverity) => {
  const iconProps = { size: 18 };
  switch (severity) {
    case 'success':
      return <Check {...iconProps} />;
    case 'error':
      return <X {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'warning':
      return <CircleAlert {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast: ShowToastProps = ({
    title,
    description = '',
    severity = 'success',
    options = {},
  }) => {
    const {
      duration = 5000,
      position,
      showProgressBar = false,
      autoClose = true,
    } = options;

    const resolvedPosition =
      position ??
      (severity === 'success'
        ? 'bottom-right'
        : severity === 'error'
          ? 'top-center'
          : 'top-center');

    toast(
      (t) => (
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className={`${toastVariants({ severity })} ${
            t.visible
              ? 'animate-in slide-in-from-top-2 fade-in'
              : 'animate-out slide-out-to-top-2 fade-out'
          }`}
        >
          {showProgressBar && (
            <div
              className="h-1 w-full bg-black/10 dark:bg-white/10"
              aria-hidden="true"
            >
              <div
                className={`${progressBarVariants({ severity })}`}
                style={{
                  animation: `toast-progress ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}

          <div className="p-4 flex items-start gap-3">
            <div
              className={`${iconVariants({ severity })} animate-toast-icon`}
              aria-hidden="true"
            >
              {getIcon(severity)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className={textVariants({ severity })}>{title}</h4>
              {description && (
                <p className={subTextVariants({ severity })}>{description}</p>
              )}
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              className={closeButtonVariants({ severity })}
              aria-label="Fechar notificação"
              type="button"
            >
              <X
                size={14}
                className="group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </div>
        </div>
      ),
      {
        duration: autoClose ? duration : Infinity,
        position: resolvedPosition,
      },
    );
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissAll,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}
