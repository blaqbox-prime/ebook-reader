import * as React from 'react';

const rendition = {
  themes: {
    override: jest.fn(),
    register: jest.fn(),
    select: jest.fn(),
    default: jest.fn(),
  },
  next: jest.fn(),
  prev: jest.fn(),
  display: jest.fn().mockResolvedValue(undefined),
  injectTheme: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  destroy: jest.fn(),
  locations: {
    generate: jest.fn().mockResolvedValue(0),
    percentage: jest.fn().mockReturnValue(0),
    totalLocations: 0,
    length: 0,
  },
};

export const renditionMock = rendition;

/**
 * Mocks `@epubjs-react-native/core`, which is what the reader actually
 * imports. (The upstream `epubjs` package is not a dependency of this app.)
 */
export const Reader = (props: Record<string, unknown>) =>
  React.createElement('Reader', props, null);

export const useEpub = () => ({
  book: { locations: rendition.locations },
  rendition,
});

export default { Reader, useEpub, rendition };
