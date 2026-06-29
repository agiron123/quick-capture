import type { AiConfig } from './config.js';

export type ChatCompletionContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatCompletionContentPart[];
};

type StreamHandlers = {
  onDelta: (delta: string) => void | Promise<void>;
};

type StreamResult = {
  content: string;
  finishReason?: string;
};

type ChatCompletionChunk = {
  choices?: {
    delta?: { content?: string };
    finish_reason?: string | null;
  }[];
};

export async function streamMiniMaxChatCompletion(
  config: AiConfig,
  messages: ChatCompletionMessage[],
  handlers: StreamHandlers
): Promise<StreamResult> {
  if (!config.minimaxApiKey) {
    throw new Error('MINIMAX_API_KEY is required for chat');
  }

  const response = await fetch(
    `${config.minimaxBaseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.minimaxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.minimaxChatModel,
        messages,
        stream: true,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `MiniMax chat failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('MiniMax chat returned no response body');
  }

  let content = '';
  let finishReason: string | undefined;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice('data:'.length).trim();
      if (!payload || payload === '[DONE]') continue;

      let chunk: ChatCompletionChunk;
      try {
        chunk = JSON.parse(payload) as ChatCompletionChunk;
      } catch {
        continue;
      }

      const choice = chunk.choices?.[0];
      const delta = choice?.delta?.content;
      if (delta) {
        content += delta;
        await handlers.onDelta(delta);
      }
      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
    }
  }

  return { content, finishReason };
}

export async function completeMiniMaxChat(
  config: AiConfig,
  messages: ChatCompletionMessage[]
): Promise<string> {
  if (!config.minimaxApiKey) {
    throw new Error('MINIMAX_API_KEY is required for chat');
  }

  const response = await fetch(
    `${config.minimaxBaseUrl.replace(/\/$/, '')}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.minimaxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.minimaxChatModel,
        messages,
        stream: false,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `MiniMax chat failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
