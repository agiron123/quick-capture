'use client';

import type { ChatAttachment } from '@quick-capture/shared';
import { useEffect, useState } from 'react';

import { Attachment } from '@/components/ui/attachment';
import { fetchChatAttachmentObjectUrl } from '@/lib/chat-client';

export function ChatMessageAttachment({ attachment }: { attachment: ChatAttachment }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    void fetchChatAttachmentObjectUrl(attachment.id)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  return (
    <Attachment
      src={src ?? undefined}
      filename={attachment.filename}
      alt={attachment.filename ?? 'Chat image attachment'}
      className="mb-2"
    />
  );
}
