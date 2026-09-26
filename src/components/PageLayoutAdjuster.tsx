import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/src/constants';
import { ReaderContext } from '@/src/types/reader.types';
import { usePreferencesStore } from '@/src/store';
import { PageLayoutPreference } from '@/src/store/preferencesStore';
import { getReaderFlow } from '@/src/utils/readerFlow';

/**
 * `rendition.flow()` repaginates asynchronously, so the saved position can only
 * be re-displayed once the reflow has settled. epubjs preserves the current CFI
 * on its own; this is a safety net, not the primary mechanism.
 */
const REFLOW_SETTLE_MS = 300;

const OPTIONS: {
  key: PageLayoutPreference;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}[] = [
  { key: 'scroll', label: 'Scroll', icon: 'align-justify' },
  { key: 'paginated', label: 'Pages', icon: 'book-open' },
];

const PageLayoutAdjuster = ({ reader }: { reader: ReaderContext }) => {
  const pageLayout = usePreferencesStore(state => state.pageLayout);
  const setPageLayout = usePreferencesStore(state => state.setPageLayout);
  const [isSwitching, setIsSwitching] = useState(false);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
    },
    []
  );

  const handleSelect = (layout: PageLayoutPreference) => {
    if (layout === pageLayout || isSwitching) return;

    // Capture the position before reflowing. Losing the reader's place
    // mid-book when they switch layout would be far worse than a brief reflow.
    const resumeCfi = reader.getCurrentLocation()?.start.cfi;

    setIsSwitching(true);
    setPageLayout(layout);
    reader.changeFlow(getReaderFlow(layout));

    if (!resumeCfi) {
      setIsSwitching(false);
      return;
    }

    if (restoreTimer.current) clearTimeout(restoreTimer.current);
    restoreTimer.current = setTimeout(() => {
      try {
        reader.goToLocation(resumeCfi);
      } catch (error) {
        // The rendition is already positioned correctly in practice, so a
        // failure here is cosmetic and must not surface to the reader.
        console.warn('Failed to restore position after layout change:', error);
      } finally {
        setIsSwitching(false);
      }
    }, REFLOW_SETTLE_MS);
  };

  return (
    <View className="w-full my-4">
      <View className="flex-row items-center gap-2 mb-2">
        <Feather
          name="layout"
          size={16}
          color={colors['golden-apricot'][300]}
        />
        <Text className="text-white font-lato-bold text-sm">Page layout</Text>
      </View>

      <View className="flex-row items-center justify-center gap-6">
        {OPTIONS.map(option => {
          const active = option.key === pageLayout;
          return (
            <TouchableOpacity
              key={option.key}
              disabled={isSwitching}
              onPress={() => handleSelect(option.key)}
              className={`flex-1 flex-row items-center justify-center gap-2 px-3 py-3 rounded-xl ${
                active ? 'bg-app-ash-brown-400' : 'bg-app-ash-brown-800'
              } ${isSwitching ? 'opacity-60' : ''}`}
            >
              {active ? (
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color={colors['golden-apricot'][300]}
                />
              ) : null}
              <Feather
                name={option.icon}
                size={16}
                color={active ? 'white' : colors['golden-apricot'][300]}
              />
              <Text
                className="text-sm"
                style={{
                  color: active ? 'white' : colors['golden-apricot'][300],
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PageLayoutAdjuster;
