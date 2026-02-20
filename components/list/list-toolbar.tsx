'use client';

import React from 'react';

interface ListToolbarProps {
  title?: string;
}

export function ListToolbar({ title }: ListToolbarProps) {
  if (!title) return null;

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
