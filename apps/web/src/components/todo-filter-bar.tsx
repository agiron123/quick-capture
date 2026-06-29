'use client';

import {
    collectTodoTags,
    filterTodos,
    type TodoDueFilter,
    type TodoPriority,
    type TodoStatusFilter,
} from '@quick-capture/shared';
import { ChevronDownIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const PRIORITY_OPTIONS: { value: TodoPriority | 'any'; label: string }[] = [
  { value: 'any', label: 'Any priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

type FilterDropdownProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  active?: boolean;
  onChange: (value: T) => void;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  active = false,
  onChange,
}: FilterDropdownProps<T>) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={active ? 'secondary' : 'outline'}
          size="sm"
          className="gap-1.5"
        >
          {selectedLabel}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const priorityValue = priority ?? 'any';
  const tagValue = tag ?? 'all-tags';

  const tagOptions = [
    { value: 'all-tags', label: 'All tags' },
    ...availableTags.map((item) => ({ value: item, label: item })),
  ];

  return (
    <div className="space-y-3 px-4 pb-2 pt-3">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search todos"
      />
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Status"
          value={status}
          options={STATUS_OPTIONS}
          active={status !== 'all'}
          onChange={onStatusChange}
        />
        <FilterDropdown
          label="Due date"
          value={due}
          options={DUE_OPTIONS}
          active={due !== 'all'}
          onChange={onDueChange}
        />
        <FilterDropdown
          label="Priority"
          value={priorityValue}
          options={PRIORITY_OPTIONS}
          active={priority !== null}
          onChange={(value) =>
            onPriorityChange(value === 'any' ? null : (value as TodoPriority))
          }
        />
        {availableTags.length > 0 ? (
          <FilterDropdown
            label="Tag"
            value={tagValue}
            options={tagOptions}
            active={tag !== null}
            onChange={(value) => onTagChange(value === 'all-tags' ? null : value)}
          />
        ) : null}
        {actions ? <div className="ml-auto flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export { collectTodoTags, filterTodos };
