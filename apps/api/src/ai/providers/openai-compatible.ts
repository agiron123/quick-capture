import type { ExtractedTodoDto } from '@quick-capture/shared';

import {
  IMAGE_EXTRACTION_SYSTEM_PROMPT,
  IMAGE_EXTRACTION_USER_TEXT,
  TRANSCRIPT_EXTRACTION_SYSTEM_PROMPT,
  transcriptUserPrompt,
} from '../prompts.js';

export type ChatProvider = {
  name: 'openai' | 'minimax';
  extractFromTranscript(transcript: string): Promise<ExtractedTodoDto[]>;
  extractFromImage(imageBase64: string, mimeType: string): Promise<ExtractedTodoDto[]>;
};

type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
};

export type OpenAiCompatibleOptions = {
  name: 'openai' | 'minimax';
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  userText: string;
  imageBase64?: string;
  imageMimeType?: string;
};

export async function callOpenAiCompatibleChat(
  options: OpenAiCompatibleOptions
): Promise<ExtractedTodoDto[]> {
  const userContent = options.imageBase64
    ? [
        { type: 'text', text: options.userText },
        {
          type: 'image_url',
          image_url: {
            url: `data:${options.imageMimeType ?? 'image/jpeg'};base64,${options.imageBase64}`,
          },
        },
      ]
    : options.userText;

  const response = await fetch(`${options.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${options.name} request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${options.name} returned an empty response`);
  }

  const parsed = JSON.parse(content) as { todos?: ExtractedTodoDto[] };
  return (parsed.todos ?? []).filter((todo) => todo.title?.trim());
}

export function createOpenAiCompatibleProvider(options: {
  name: 'openai' | 'minimax';
  apiKey: string;
  baseUrl: string;
  model: string;
}): ChatProvider {
  return {
    name: options.name,
    extractFromTranscript: (transcript: string) =>
      callOpenAiCompatibleChat({
        ...options,
        systemPrompt: TRANSCRIPT_EXTRACTION_SYSTEM_PROMPT,
        userText: transcriptUserPrompt(transcript),
      }),
    extractFromImage: (imageBase64: string, mimeType: string) =>
      callOpenAiCompatibleChat({
        ...options,
        systemPrompt: IMAGE_EXTRACTION_SYSTEM_PROMPT,
        userText: IMAGE_EXTRACTION_USER_TEXT,
        imageBase64,
        imageMimeType: mimeType,
      }),
  };
}
