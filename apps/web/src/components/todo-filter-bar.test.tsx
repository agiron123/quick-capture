import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TodoFilterBar } from './todo-filter-bar';

describe('TodoFilterBar', () => {
  it('updates search query', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();

    render(
      <TodoFilterBar
        query=""
        status="all"
        priority={null}
        tag={null}
        due="all"
        availableTags={['work']}
        onQueryChange={onQueryChange}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onTagChange={vi.fn()}
        onDueChange={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText('Search todos'), 'milk');
    expect(onQueryChange).toHaveBeenCalled();
    expect(onQueryChange.mock.calls.at(-1)?.[0]).toContain('k');
  });

  it('renders optional actions', () => {
    render(
      <TodoFilterBar
        query=""
        status="all"
        priority={null}
        tag={null}
        due="all"
        availableTags={[]}
        onQueryChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onTagChange={vi.fn()}
        onDueChange={vi.fn()}
        actions={<button type="button">Export</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });
});
