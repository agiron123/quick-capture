import { useState } from 'react';
import {
  ActivityIndicator,
  PlatformColor,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/Themed';

type ChatComposerProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
  const [draft, setDraft] = useState('');

  function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setDraft('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Message the assistant…"
        placeholderTextColor={PlatformColor('placeholderText')}
        accessibilityLabel="Message the assistant"
        multiline
        style={styles.input}
        editable={!disabled}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={handleSend}
        disabled={disabled || !draft.trim()}
        style={[styles.sendButton, (disabled || !draft.trim()) && styles.sendButtonDisabled]}>
        {disabled ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendLabel}>Send</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PlatformColor('separator'),
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: PlatformColor('systemBackground'),
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor('separator'),
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: PlatformColor('label'),
    backgroundColor: PlatformColor('secondarySystemBackground'),
  },
  sendButton: {
    minWidth: 64,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlatformColor('systemBlue'),
    paddingHorizontal: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
