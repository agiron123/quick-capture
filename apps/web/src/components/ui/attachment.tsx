'use client';

import { Paperclip, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AttachmentProps = React.ComponentProps<'div'> & {
  src?: string;
  alt?: string;
  filename?: string;
  onRemove?: () => void;
};

function Attachment({
  className,
  src,
  alt = 'Image attachment',
  filename,
  onRemove,
  ...props
}: AttachmentProps) {
  return (
    <div
      data-slot="attachment"
      className={cn(
        'border-border bg-muted/40 relative inline-flex max-w-xs overflow-hidden rounded-lg border',
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="max-h-40 w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-24 w-32 items-center justify-center text-xs">
          {filename ?? 'Attachment'}
        </div>
      )}
      {onRemove ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute top-1 right-1 size-6"
          onClick={onRemove}
          aria-label="Remove attachment"
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

type AttachmentPickerProps = {
  disabled?: boolean;
  onSelect: (file: File) => void;
};

function AttachmentPicker({ disabled, onSelect }: AttachmentPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled}
        aria-label="Attach image"
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="size-4" aria-hidden />
      </Button>
    </>
  );
}

export { Attachment, AttachmentPicker };
