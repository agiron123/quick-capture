import { describe, expect, it } from 'vitest';

import { buildReviewSavePayload, normalizeReviewTitles } from './review-todos';

describe('normalizeReviewTitles', () => {
  it('trims and removes blank titles', () => {
    expect(normalizeReviewTitles(['  Buy milk  ', '', '  '])).toEqual(['Buy milk']);
  });
});

describe('buildReviewSavePayload', () => {
  it('builds save payload for cleaned titles', () => {
    expect(
      buildReviewSavePayload({
        titles: ['  Buy milk  ', 'Call dentist'],
        source: 'voice',
        transcript: 'buy milk',
      })
    ).toEqual({
      titles: ['Buy milk', 'Call dentist'],
      source: 'voice',
      captureId: undefined,
      transcript: 'buy milk',
    });
  });

  it('returns null when no valid titles remain', () => {
    expect(
      buildReviewSavePayload({
        titles: ['   '],
        source: 'capture',
      })
    ).toBeNull();
  });
});
