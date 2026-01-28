import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

interface Props {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  navigateOnPress?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search businesses...',
  autoFocus = false,
  navigateOnPress = false,
}: Props) {
  if (navigateOnPress) {
    return (
      <Pressable style={styles.container} onPress={() => router.push('/search')}>
        <Ionicons name="search" size={18} color={Colors.gray} />
        <View style={styles.inputPlaceholder}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.gray}
            editable={false}
            pointerEvents="none"
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.gray} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChangeText?.('')}>
          <Ionicons name="close-circle" size={18} color={Colors.gray} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    padding: 0,
  },
  inputPlaceholder: {
    flex: 1,
  },
});
