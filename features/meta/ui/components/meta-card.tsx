'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  Star,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Meta,
  useMetaContext,
  MetaTask,
} from '@/features/meta/application/context/meta-context';
import { cn } from '@/lib/utils';

const TONE_MAP: Record<string, string> = {
  primary: 'var(--laranja)',
  success: 'var(--esmeralda)',
  warning: 'var(--amber)',
  error: 'var(--vermelho)',
  info: 'var(--azul)',
  secondary: 'var(--cinza)',
  accent: 'var(--rosa)',
};

interface MetaCardProps {
  meta: Meta;
  onEdit: (meta: Meta) => void;
}

export function MetaCard({ meta, onEdit }: MetaCardProps) {
  const { addTask, deleteMeta } = useMetaContext();
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const saveTask = async (description: string) => {
    const trimmed = description.trim();
    if (!trimmed || !isAddingTask) return;

    setIsAddingTask(false);
    setNewTaskDescription('');

    await addTask(meta.id, { description: trimmed });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTask(newTaskDescription);
  };

  const completedTasks = meta.tasks.filter((t) => t.completed);
  const pendingTasks = meta.tasks.filter((t) => !t.completed);
  const progress =
    meta.tasks.length > 0
      ? Math.round((completedTasks.length / meta.tasks.length) * 100)
      : 0;

  const toneColor = TONE_MAP[meta.tone] || 'var(--indigo)';

  return (
    <div
      data-tone={meta.tone}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-card/40 transition-all duration-300',
        'w-full h-full min-h-55 relative overflow-hidden',
        'shadow-sm hover:shadow-md',
      )}
      style={
        {
          borderTop: `3px solid var(--tone-color)`,
          '--tone-color': toneColor,
        } as React.CSSProperties
      }
    >
      <div className="flex items-start justify-between p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight truncate">
              {meta.title}
            </h3>
            {progress === 100 && (
              <CheckCircle2 size={16} className="text-success shrink-0" />
            )}
          </div>
          {meta.description && (
            <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap wrap-break-word">
              {meta.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(meta)}
            className="h-8 w-8 cursor-pointer"
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMeta(meta.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="px-5 pb-2">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-(--tone-color) transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>{progress}% Concluído</span>
          <span>
            {completedTasks.length}/{meta.tasks.length} Tarefas
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1 p-2 flex-1">
        {pendingTasks.map((task) => (
          <TaskItem key={task.id} task={task} metaId={meta.id} />
        ))}

        {isAddingTask ? (
          <form
            onSubmit={handleAddTask}
            className="flex items-center gap-2 p-1"
          >
            <div className="flex-1 relative">
              <Input
                autoFocus
                placeholder="O que precisa ser feito?"
                className="h-9 pr-10 text-sm bg-background/50 border-primary/20 focus-visible:ring-1 focus-visible:ring-primary/30"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingTask(false);
                    setNewTaskDescription('');
                  }
                }}
                onBlur={() => {
                  if (newTaskDescription.trim()) {
                    saveTask(newTaskDescription);
                  } else {
                    setIsAddingTask(false);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={cn(
                  'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer transition-opacity',
                  !newTaskDescription.trim() && 'opacity-0 pointer-events-none',
                )}
                disabled={!newTaskDescription.trim()}
              >
                <CheckCircle2 size={16} />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-muted cursor-pointer shrink-0"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskDescription('');
              }}
            >
              <X size={14} />
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 p-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Adicionar tarefa
          </button>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-2 border-t border-border/40 pt-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span>Concluídas ({completedTasks.length})</span>
              {showCompleted ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>

            {showCompleted &&
              completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} metaId={meta.id} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, metaId }: { task: MetaTask; metaId: string }) {
  const { updateTask, deleteTask } = useMetaContext();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description);

  const handleSave = async () => {
    if (description.trim() && description !== task.description) {
      await updateTask(metaId, task.id, { description: description.trim() });
    } else if (!description.trim()) {
      setDescription(task.description);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group/item flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/40',
        task.completed && 'opacity-60',
        isEditing && 'bg-muted/60 ring-1 ring-primary/20',
      )}
    >
      <button
        onClick={() =>
          updateTask(metaId, task.id, { completed: !task.completed })
        }
        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 size={18} className="text-success fill-success/10" />
        ) : (
          <Circle size={18} />
        )}
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            autoFocus
            className="h-8 py-0 px-2 text-sm flex-1 bg-background border-primary/20 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setDescription(task.description);
                setIsEditing(false);
              }
            }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSave}
              className="p-1 rounded- hover:bg-success/10 text-success cursor-pointer transition-colors"
              title="Salvar"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              onClick={() => {
                setDescription(task.description);
                setIsEditing(false);
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Cancelar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <span
          className={cn(
            'flex-1 text-sm transition-all wrap-break-word',
            task.completed && 'line-through text-muted-foreground',
            task.isHighlighted && !task.completed && 'font-bold',
          )}
          onDoubleClick={() => !task.completed && setIsEditing(true)}
        >
          {task.description}
        </span>
      )}

      {!task.completed && (
        <div className="flex items-center gap-1 opacity-100 transition-opacity shrink-0">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() =>
              updateTask(metaId, task.id, {
                isHighlighted: !task.isHighlighted,
              })
            }
            className={cn(
              'p-1 rounded-md hover:bg-muted transition-colors cursor-pointer',
              task.isHighlighted ? 'text-amber-500' : 'text-muted-foreground',
            )}
          >
            <Star
              size={14}
              fill={task.isHighlighted ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={() => deleteTask(metaId, task.id)}
            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
