'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AppBadgeTone, CATEGORY_TONE_OPTIONS } from '@/lib/tone-options';

interface ToneSelectProps {
  value: AppBadgeTone;
  onChange: (tone: AppBadgeTone) => void;
  className?: string;
}

export function ToneSelect({ value, onChange, className }: ToneSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as AppBadgeTone)}
    >
      <SelectTrigger className={cn('h-8 w-36 text-xs bg-background border-border/40 cursor-pointer', className)}>
        <SelectValue className="max-w-full truncate" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_TONE_OPTIONS.map((toneOption) => (
          <SelectItem
            key={toneOption.value}
            value={toneOption.value}
            className="cursor-pointer text-xs"
            title={toneOption.label}
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <span className={cn('h-2 w-2 rounded-full', toneOption.dotClassName)} />
              <span className="truncate">{toneOption.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
