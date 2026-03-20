'use client';

import { useState } from 'react';
import { Plus, Target, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMetaContext,
  Meta,
} from '@/features/meta/application/context/meta-context';
import { MetaCard } from './meta-card';
import { MetaModal } from './meta-modal';

export function MetaGrid() {
  const { metas, loading, isProcessing } = useMetaContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeta(null);
  };

  const filteredMetas = metas.filter(
    (meta) =>
      meta.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meta.description &&
        meta.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading && metas.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-4"
          >
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar metas..."
            className="pl-9 h-10 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 h-10 px-6 font-bold shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Nova Meta
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Salvando alterações...
        </div>
      )}

      {filteredMetas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Target size={40} className="text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Nenhuma meta encontrada
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            {searchQuery
              ? `Não encontramos resultados para "${searchQuery}". Tente outro termo.`
              : 'Defina seus objetivos agora e comece a acompanhar seu progresso diário.'}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setIsModalOpen(true)}
            >
              Criar minha primeira meta
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredMetas.map((meta) => (
            <MetaCard key={meta.id} meta={meta} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <MetaModal meta={editingMeta} onClose={handleCloseModal} />
      )}
    </div>
  );
}
