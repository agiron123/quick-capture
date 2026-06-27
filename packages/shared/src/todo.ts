export type TodoSource = 'manual' | 'capture' | 'voice' | 'watch';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  source: TodoSource;
  createdAt: string;
  noteImageUri?: string;
  noteAudioUri?: string;
  transcript?: string;
};

export type ExtractedTodo = {
  title: string;
};
