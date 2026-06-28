'use client';

import {
  collectTodoTags,
  filterTodos,
  type TodoDueFilter,
  type TodoPriority,
  type TodoStatusFilter,
} from '@quick-capture/shared';
import type { ReactNode } from 'react';

import { Input } from '@/components/ui/input';

type TodoFilterBarProps = {
  query: string;
  status: TodoStatusFilter;
  priority: TodoPriority | null;
  tag: string | null;
  due: TodoDueFilter;
  availableTags: string[];
  onQueryChange: (query: string) => void;
  onStatusChange: (status: TodoStatusFilter) => void;
  onPriorityChange: (priority: TodoPriority | null) => void;
  onTagChange: (tag: string | null) => void;
  onDueChange: (due: TodoDueFilter) => void;
  actions?: ReactNode;
};

const STATUS_OPTIONS: { value: TodoStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'done', label: 'Done' },
];

const DUE_OPTIONS: { value: TodoDueFilter; label: string }[] = [
  { value: 'all', label: 'Any due' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'no-due', label: 'No date' },
];

const PRIORITY_OPTIONS: { value: TodoPriority | null; label: string }[] = [
  { value: null, label: 'Any priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
        selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export function TodoFilterBar({
  query,
  status,
  priority,
  tag,
  due,
  availableTags,
  onQueryChange,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onDueChange,
  actions,
}: TodoFilterBarProps) {
  return (
    <div className="space-y-3 px-4 pb-2 pt-3">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search todos"
      />
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={status === option.value}
            onClick={() => onStatusChange(option.value)}
          />
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DUE_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={due === option.value}
            onClick={() => onDueChange(option.value)}
          />
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRIORITY_OPTIONS.map((option) => (
          <FilterChip
            key={option.label}
            label={option.label}
            selected={priority === option.value}
            onClick={() => onPriorityChange(option.value)}
          />
        ))}
      </div>
      {availableTags.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip label="All tags" selected={!tag} onClick={() => onTagChange(null)} />
          {availableTags.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={tag === item}
              onClick={() => onTagChange(item)}
            />
          ))}
        </div>
      ) : null}
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export { collectTodoTags, filterTodos };
