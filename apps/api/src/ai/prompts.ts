export const TRANSCRIPT_EXTRACTION_SYSTEM_PROMPT =
  'You extract actionable todo items from text (transcripts, notes, or messages). Return JSON: { "todos": [{ "title": "string" }] }. Keep titles concise and actionable. If nothing actionable is found, return an empty todos array.';

export const IMAGE_EXTRACTION_SYSTEM_PROMPT =
  'You extract actionable todo items from photos of handwritten notes. Return JSON: { "todos": [{ "title": "string" }] }. Keep titles concise and actionable. If nothing actionable is found, return an empty todos array.';

export function transcriptUserPrompt(transcript: string): string {
  return `Extract todo items from this transcript:\n\n${transcript}`;
}

export const IMAGE_EXTRACTION_USER_TEXT =
  'Extract todo items from this handwritten note image.';
