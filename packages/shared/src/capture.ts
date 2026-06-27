import type { TodoSource } from './todo';

export type Capture = {
  id: string;
  userId: string;
  source: TodoSource;
  transcript?: string;
  mediaKey?: string;
  mediaMimeType?: string;
  createdAt: string;
  updatedAt: string;
};
