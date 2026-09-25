import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useUserProfileStore } from '@/src/store';

interface UserAvatarProps {
  size?: number;
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const UserAvatar = ({
  size = 40,
  uri,
  style,
  accessibilityLabel,
}: UserAvatarProps) => {
  const savedAvatarUri = useUserProfileStore(state => state.avatarUri);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const resolvedUri = uri === undefined ? savedAvatarUri : uri;
  const imageUri =
    resolvedUri && failedUri !== resolvedUri ? resolvedUri : null;

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      className="bg-m3-surface-high rounded-full overflow-hidden"
      style={[styles.avatar, { width: size, height: size }, style]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={styles.image}
          onError={() => setFailedUri(imageUri)}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons
            name="person"
            size={Math.round(size * 0.55)}
            color="#52443b"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default UserAvatar;
