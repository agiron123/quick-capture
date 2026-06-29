import { useLocalSearchParams } from 'expo-router';

import { ChatThreadScreen } from '@/components/chat-thread-screen';

export default function ChatDetailScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  return <ChatThreadScreen threadId={threadId} />;
}
