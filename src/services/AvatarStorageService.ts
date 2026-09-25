import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const profileDirectory = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}profile/`
  : null;

const getFileExtension = (uri: string): string => {
  const fileName = uri.split('?')[0].split('/').pop() ?? '';
  const separatorIndex = fileName.lastIndexOf('.');

  if (separatorIndex <= 0) return 'jpg';

  const extension = fileName.slice(separatorIndex + 1).toLowerCase();
  return /^[a-z0-9]{1,5}$/.test(extension) ? extension : 'jpg';
};

class AvatarStorageService {
  static async save(sourceUri: string): Promise<string> {
    if (Platform.OS === 'web' || sourceUri.startsWith('data:')) {
      return sourceUri;
    }

    if (!profileDirectory) {
      throw new Error('Profile photo storage is unavailable.');
    }

    const directoryInfo = await FileSystem.getInfoAsync(profileDirectory);
    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(profileDirectory, {
        intermediates: true,
      });
    }

    const extension = getFileExtension(sourceUri);
    const fileName = `avatar-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;
    const destinationUri = `${profileDirectory}${fileName}`;

    try {
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri,
      });
      return destinationUri;
    } catch (error) {
      await FileSystem.deleteAsync(destinationUri, { idempotent: true });
      throw error;
    }
  }

  static async remove(uri: string | null): Promise<void> {
    if (
      !uri ||
      Platform.OS === 'web' ||
      !profileDirectory ||
      !uri.startsWith(profileDirectory)
    ) {
      return;
    }

    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch {
      return;
    }
  }
}

export default AvatarStorageService;
