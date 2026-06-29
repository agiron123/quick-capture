import { ChatPageClient } from '@/components/chat-page-client';

type ChatThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = await params;
  return <ChatPageClient threadId={threadId} />;
}
