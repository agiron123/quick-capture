import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { PlatformColor, Pressable, Text, View } from 'react-native';

import { useLists } from '@/hooks/use-lists';

export function ListPickerHeaderButton() {
  const { activeList } = useLists();

  return (
    <Link href="/manage-lists" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch list"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 }}>
        <Text
          numberOfLines={1}
          style={{ color: PlatformColor('label'), fontSize: 17, fontWeight: '600', maxWidth: 160 }}>
          {activeList?.name ?? 'Lists'}
        </Text>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
          tintColor={PlatformColor('secondaryLabel')}
          size={14}
        />
      </Pressable>
    </Link>
  );
}

export function ListPickerHeaderTitle() {
  const { activeList } = useLists();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ color: PlatformColor('label'), fontSize: 17, fontWeight: '600' }}>
        {activeList?.name ?? 'Todos'}
      </Text>
    </View>
  );
}
