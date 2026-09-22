import Constants from 'expo-constants';

export type AppEnv = {
  EXPO_GOOGLE_BOOKS_API_KEY: string;
  EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY: string;
};

const readEnvValue = (keys: readonly string[]): string | undefined => {
  const processEnv =
    typeof process !== 'undefined' && process.env ? process.env : undefined;

  for (const key of keys) {
    const value = processEnv?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  const expoExtra = Constants.expoConfig?.extra ?? {};
  const manifestExtra =
    'manifest' in Constants &&
    Constants.manifest &&
    'extra' in Constants.manifest
      ? (Constants.manifest.extra as Record<string, unknown> | undefined)
      : undefined;

  const extra = { ...manifestExtra, ...expoExtra };

  for (const key of keys) {
    const value = extra[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const getRequiredEnv = <K extends keyof AppEnv>(key: K): AppEnv[K] => {
  const aliases: Record<keyof AppEnv, readonly string[]> = {
    EXPO_GOOGLE_BOOKS_API_KEY: [
      'EXPO_GOOGLE_BOOKS_API_KEY',
      'EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY',
    ],
    EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY: [
      'EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY',
      'EXPO_GOOGLE_BOOKS_API_KEY',
    ],
  };

  const value = readEnvValue(aliases[key]);

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${String(key)}. Add it to your .env file or app config extra.`
    );
  }

  return value as AppEnv[K];
};

export const env: AppEnv = {
  EXPO_GOOGLE_BOOKS_API_KEY: getRequiredEnv('EXPO_GOOGLE_BOOKS_API_KEY'),
  EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY: getRequiredEnv(
    'EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY'
  ),
};

export const getEnv = <K extends keyof AppEnv>(key: K): AppEnv[K] => env[key];
