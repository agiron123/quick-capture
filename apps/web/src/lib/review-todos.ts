import type { TodoSource } from '@quick-capture/shared';

export type ReviewSavePayload = {
  titles: string[];
  source: TodoSource;
  captureId?: string;
  transcript?: string;
};

export function normalizeReviewTitles(titles: string[]): string[] {
  return titles.map((title) => title.trim()).filter(Boolean);
}

export function buildReviewSavePayload(input: {
  titles: string[];
  source: TodoSource;
  captureId?: string;
  transcript?: string;
}): ReviewSavePayload | null {
  const cleaned = normalizeReviewTitles(input.titles);
  if (cleaned.length === 0) return null;

  return {
    titles: cleaned,
    source: input.source,
    captureId: input.captureId,
    transcript: input.transcript,
  };
}
