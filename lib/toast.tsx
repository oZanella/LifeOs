'use client';

import { cva } from 'class-variance-authority';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

interface ShowToastParams {
  title: string;
  description?: string;
  severity?: ToastSeverity;
}

const containerVariants = cva(
  'relative w-full max-w-md overflow-hidden rounded-md border shadow-md',
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
  },
);

const iconVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-lg',
  {
    variants: {
      severity: {
        success: 'bg-linear-to-br from-emerald-400 to-green-500',
        error: 'bg-linear-to-br from-rose-400 to-red-500',
        info: 'bg-linear-to-br from-blue-400 to-cyan-500',
        warning: 'bg-linear-to-br from-amber-400 to-orange-500',
      },
    },
  },
);

const titleVariants = cva('text-sm font-semibold leading-tight', {
  variants: {
    severity: {
      success: 'text-emerald-900 dark:text-emerald-100',
      error: 'text-rose-900 dark:text-rose-100',
      info: 'text-blue-900 dark:text-blue-100',
      warning: 'text-amber-900 dark:text-amber-100',
    },
  },
});

const descriptionVariants = cva('mt-1 text-sm leading-relaxed', {
  variants: {
    severity: {
      success: 'text-emerald-700 dark:text-emerald-200',
      error: 'text-rose-700 dark:text-rose-200',
      info: 'text-blue-700 dark:text-blue-200',
      warning: 'text-amber-700 dark:text-amber-200',
    },
  },
});

const ICONS = {
  success: Check,
  error: X,
  info: Info,
  warning: CircleAlert,
} satisfies Record<ToastSeverity, React.ElementType>;

export function showToast({
  title,
  description,
  severity = 'success',
}: ShowToastParams) {
  const Icon = ICONS[severity];

  toast(
    (t) => (
      <div
        role="alert"
        className={`${containerVariants({ severity })} ${
          t.visible
            ? 'animate-in slide-in-from-top-2 fade-in'
            : 'animate-out slide-out-to-top-2 fade-out'
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <div className={iconVariants({ severity })} aria-hidden="true">
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className={titleVariants({ severity })}>{title}</p>
            {description && (
              <p className={descriptionVariants({ severity })}>{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            aria-label="Fechar notificação"
            className="shrink-0 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    ),
    {
      duration: severity === 'error' ? 6000 : 3000,
      position: severity === 'success' ? 'bottom-right' : 'top-center',
    },
  );
}
