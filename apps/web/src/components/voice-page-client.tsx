'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app-shell';
import { ReviewTodosDialog, type ReviewSavePayload } from '@/components/review-todos-dialog';
import { VoiceRecorder, type VoiceRecordingResult } from '@/components/voice-recorder';
import { useLists } from '@/hooks/use-lists';
import { useTodos } from '@/hooks/use-todos';
import { extractTodosFromTranscript, extractTodosFromVoice } from '@/lib/ai-client';
import { createTodosBatch, uploadCapture } from '@/lib/api-client-client';

export function VoicePageClient() {
  const { activeListId } = useLists();
  const { refetch } = useTodos(activeListId);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTitles, setReviewTitles] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<string>();
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleRecording = async ({ blob, transcript }: VoiceRecordingResult) => {
    setIsBusy(true);
    try {
      const result = transcript
        ? {
            transcript,
            todos: await extractTodosFromTranscript(transcript),
          }
        : await extractTodosFromVoice(blob);
      setPendingBlob(blob);
      setTranscript(result.transcript);
      setReviewTitles(result.todos.map((todo) => todo.title));
      setReviewOpen(true);

      if (result.todos.length === 0) {
        toast.message('No todos extracted — review the transcript and add lines manually.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not process recording');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveReview = async (payload: ReviewSavePayload) => {
    let captureId: string | undefined;

    if (pendingBlob) {
      const uploaded = await uploadCapture({
        file: pendingBlob,
        filename: 'recording.webm',
        source: 'voice',
        transcript: payload.transcript,
      });
      captureId = uploaded.captureId;
    }

    await createTodosBatch(
      activeListId,
      payload.titles.map((title) => ({
        title,
        source: 'voice',
        captureId,
        transcript: payload.transcript,
      }))
    );

    await refetch();
    toast.success('Todos saved');
    setPendingBlob(null);
    setTranscript(undefined);
  };

  return (
    <AppShell showMicFab={false}>
      <div className="mx-auto max-w-lg p-4">
        <h1 className="mb-2 text-center text-2xl font-semibold">Voice capture</h1>
        <VoiceRecorder onComplete={handleRecording} disabled={isBusy} />
      </div>

      <ReviewTodosDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        source="voice"
        initialTitles={reviewTitles}
        transcript={transcript}
        onSave={handleSaveReview}
      />
    </AppShell>
  );
}
