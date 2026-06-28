'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app-shell';
import { ReviewTodosDialog, type ReviewSavePayload } from '@/components/review-todos-dialog';
import { Button } from '@/components/ui/button';
import { useLists } from '@/hooks/use-lists';
import { useTodos } from '@/hooks/use-todos';
import { extractTodosFromImage } from '@/lib/ai-client';
import { createTodosBatch, uploadCapture } from '@/lib/api-client-client';

export function CapturePageClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeListId } = useLists();
  const { refetch } = useTodos(activeListId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTitles, setReviewTitles] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const extracted = await extractTodosFromImage(file);
      if (extracted.length === 0) {
        toast.error('No todos found — try a clearer photo.');
        return;
      }

      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReviewTitles(extracted.map((todo) => todo.title));
      setReviewOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReview = async (payload: ReviewSavePayload) => {
    let captureId: string | undefined;

    if (pendingFile) {
      const uploaded = await uploadCapture({
        file: pendingFile,
        source: 'capture',
      });
      captureId = uploaded.captureId;
    }

    await createTodosBatch(
      activeListId,
      payload.titles.map((title) => ({
        title,
        source: 'capture',
        captureId,
      }))
    );

    await refetch();
    toast.success('Todos saved');
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
  };

  return (
    <AppShell showMicFab={false}>
      <div className="flex flex-col items-center gap-6 p-8">
        <h1 className="text-2xl font-semibold">Capture a note</h1>
        <p className="max-w-md text-center text-muted-foreground">
          Upload a photo of handwritten notes or use your webcam.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = '';
          }}
        />

        <div className="flex flex-wrap justify-center gap-3">
          <Button disabled={isProcessing} onClick={() => fileInputRef.current?.click()}>
            {isProcessing ? 'Processing…' : 'Choose photo'}
          </Button>
          <Button
            variant="outline"
            disabled={isProcessing}
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0);
                stream.getTracks().forEach((track) => track.stop());

                canvas.toBlob((blob) => {
                  if (!blob) return;
                  void handleFile(new File([blob], 'webcam.jpg', { type: 'image/jpeg' }));
                }, 'image/jpeg');
              } catch {
                toast.error('Camera permission is required.');
              }
            }}
          >
            Use webcam
          </Button>
        </div>
      </div>

      <ReviewTodosDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        source="capture"
        initialTitles={reviewTitles}
        previewUrl={previewUrl}
        onSave={handleSaveReview}
      />
    </AppShell>
  );
}
