import { File } from 'expo-file-system';

import type { ExtractedTodo } from '@/types/todo';

const MOCK_TODOS: ExtractedTodo[] = [
  { title: 'Review meeting notes' },
  { title: 'Send follow-up email' },
  { title: 'Schedule dentist appointment' },
];

async function imageToBase64(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();
  return base64;
}

async function extractWithOpenAI(imageUri: string): Promise<ExtractedTodo[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
  }

  const base64 = await imageToBase64(imageUri);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You extract actionable todo items from photos of handwritten notes. Return JSON: { "todos": [{ "title": "string" }] }. Keep titles concise and actionable. If nothing actionable is found, return an empty todos array.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract todo items from this handwritten note image.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = JSON.parse(content) as { todos?: ExtractedTodo[] };
  return (parsed.todos ?? []).filter((todo) => todo.title?.trim());
}

export async function extractTodosFromImage(imageUri: string): Promise<ExtractedTodo[]> {
  const useMock = process.env.EXPO_PUBLIC_USE_MOCK_AI === 'true' || !process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_TODOS;
  }

  return extractWithOpenAI(imageUri);
}
