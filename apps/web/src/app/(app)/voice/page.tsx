import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function VoicePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Voice capture</h1>
      <p className="max-w-md text-muted-foreground">
        MediaRecorder voice flow and review modal coming in the next slice.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to todos</Link>
      </Button>
    </div>
  );
}
