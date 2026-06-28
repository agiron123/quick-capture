import type { ExtractedTodo } from '@/types/todo';

const EXTRACTION_SYSTEM_PROMPT =
  'You extract actionable todo items from text (transcripts, notes, or messages). Return JSON: { "todos": [{ "title": "string" }] }. Keep titles concise and actionable. If nothing actionable is found, return an empty todos array.';

export async function extractTodosFromTranscript(transcript: string): Promise<ExtractedTodo[]> {
  const trimmed = transcript.trim();
  if (!trimmed) return [];

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
  }

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
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Extract todo items from this transcript:\n\n${trimmed}`,
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
