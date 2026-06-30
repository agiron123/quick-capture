import { describe, expect, it } from 'vitest';

import {
  buildCaptureDeepLink,
  captureDeepLinks,
  captureRoutes,
} from './capture-deep-links';

describe('capture-deep-links', () => {
  it('builds scheme URLs without leading slash', () => {
    expect(buildCaptureDeepLink(captureRoutes.voice)).toBe('quickcapture://voice-record');
    expect(buildCaptureDeepLink(captureRoutes.camera)).toBe('quickcapture://capture');
    expect(buildCaptureDeepLink(captureRoutes.addTodo)).toBe('quickcapture://add-todo');
  });

  it('exports preset deep links', () => {
    expect(captureDeepLinks.voice).toBe('quickcapture://voice-record');
    expect(captureDeepLinks.camera).toBe('quickcapture://capture');
  });
});
