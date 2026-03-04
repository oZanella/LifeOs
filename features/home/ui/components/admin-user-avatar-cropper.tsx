'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarCropState } from '../view/home-configuracoes.types';
import { getCropLayout } from '../view/home-configuracoes.utils';

interface AdminUserAvatarCropperProps {
  itemId: number;
  crop: AvatarCropState;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>, userId: number) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>, userId: number) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>, userId: number) => void;
  onWheel: (event: React.WheelEvent<HTMLDivElement>, userId: number) => void;
  onZoomStep: (userId: number, step: number) => void;
  onZoomSet: (userId: number, zoom: number) => void;
  onReset: (userId: number) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function AdminUserAvatarCropper({
  itemId,
  crop,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onZoomStep,
  onZoomSet,
  onReset,
  onApply,
  onCancel,
}: AdminUserAvatarCropperProps) {
  const layout = getCropLayout(crop);

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/60 bg-background/90 p-3 shadow-sm">
      <p className="text-xs text-muted-foreground">
        Arraste para ajustar. Use o scroll para zoom.
      </p>

      <div
        className="mx-auto h-55 w-55 overflow-hidden rounded-full border border-border/60 bg-gradient-to-br from-muted/40 to-background relative cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(event) => onPointerDown(event, itemId)}
        onPointerMove={(event) => onPointerMove(event, itemId)}
        onPointerUp={(event) => onPointerUp(event, itemId)}
        onPointerCancel={(event) => onPointerUp(event, itemId)}
        onWheel={(event) => onWheel(event, itemId)}
      >
        <img
          src={crop.imageSrc}
          alt="Recorte de avatar"
          className="absolute select-none pointer-events-none"
          style={{
            width: `${layout.renderedWidth}px`,
            height: `${layout.renderedHeight}px`,
            left: `${layout.left}px`,
            top: `${layout.top}px`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 border border-dashed border-white/35 rounded-full" />
        <div className="pointer-events-none absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 bg-white/25" />
        <div className="pointer-events-none absolute top-1/2 left-3 right-3 h-px -translate-y-1/2 bg-white/25" />
      </div>

      <div className="space-y-2 rounded-lg border border-border/50 bg-muted/25 p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <span className="text-xs font-medium text-foreground/80">
            {Math.round(crop.zoom * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onZoomStep(itemId, -0.1)}
            aria-label="Diminuir zoom"
          >
            <Minus size={14} />
          </Button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={crop.zoom}
            onChange={(event) => onZoomSet(itemId, Number(event.target.value))}
            className="w-full cursor-pointer"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onZoomStep(itemId, 0.1)}
            aria-label="Aumentar zoom"
          >
            <Plus size={14} />
          </Button>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs cursor-pointer"
            onClick={() => onReset(itemId)}
          >
            <RotateCcw size={12} className="mr-1" />
            Centralizar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onApply} className="cursor-pointer">
          Aplicar recorte
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="cursor-pointer">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
