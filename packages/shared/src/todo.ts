export type TodoSource = 'manual' | 'capture' | 'voice' | 'watch';

export type TodoPriority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  source: TodoSource;
  listId: string;
  parentId?: string;
  createdAt: string;
  sortOrder: number;
  updatedAt?: string;
  priority?: TodoPriority;
  dueAt?: string;
  reminderAt?: string;
  notificationId?: string;
  captureId?: string;
  noteImageUri?: string;
  noteAudioUri?: string;
  transcript?: string;
  tags?: string[];
};

export type ExtractedTodo = {
  title: string;
  reminderAt?: string;
};
