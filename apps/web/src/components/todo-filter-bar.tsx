'use client';

import { filterTodos, type TodoStatusFilter } from '@quick-capture/shared';
import { Input } from '@/components/ui/input';

type TodoFilterBarProps = {
  query: string;
  status: TodoStatusFilter;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TodoStatusFilter) => void;
};

const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

export function TodoFilterBar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: TodoFilterBarProps) {
  return (
    <div className="space-y-3 px-4 pb-2 pt-3">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search todos"
      />
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((option) => {
          const selected = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { filterTodos };
