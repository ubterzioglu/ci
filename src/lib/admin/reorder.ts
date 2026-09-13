import type { ActionResult } from '@/lib/types';

/** {id, sortOrder} pairs, the payload every admin reorder action accepts. */
export interface SortUpdate {
  id: string;
  sortOrder: number;
}

interface MoveByOneRequest<T extends { id: string }> {
  /** Current order, as rendered. */
  list: T[];
  /** Index of the row being moved. */
  index: number;
  direction: 'up' | 'down';
  /** Render the new order optimistically. */
  apply: (next: T[]) => void;
  /** Persist the new sort orders (1-based, in list order). */
  persist: (updates: SortUpdate[]) => Promise<ActionResult>;
  /** Report a rejected move, after the optimistic order has been rolled back. */
  onError: (message: string) => void;
}

/**
 * Move one row up or down by swapping it with its neighbour, then persist the
 * resulting order. The new order is applied optimistically and rolled back if
 * the server rejects it. Moving past either end of the list is a no-op.
 *
 * Shared by the menu panel's category and item lists, which reorder identically.
 */
export async function moveByOne<T extends { id: string }>({
  list,
  index,
  direction,
  apply,
  persist,
  onError,
}: MoveByOneRequest<T>): Promise<void> {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return;

  const moved = list[index];
  const displaced = list[targetIndex];
  if (!moved || !displaced) return;

  const next = [...list];
  next[index] = displaced;
  next[targetIndex] = moved;
  apply(next);

  const result = await persist(next.map((row, i) => ({ id: row.id, sortOrder: i + 1 })));
  if (!result.ok) {
    apply(list);
    onError(result.error);
  }
}
