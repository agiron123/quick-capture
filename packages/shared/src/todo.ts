export type TodoSource = 'manual' | 'capture' | 'voice' | 'watch';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  source: TodoSource;
  listId: string;
  createdAt: string;
  sortOrder: number;
  reminderAt?: string;
  notificationId?: string;
  noteImageUri?: string;
  noteAudioUri?: string;
  transcript?: string;
};

export type ExtractedTodo = {
  title: string;
  reminderAt?: string;
};
