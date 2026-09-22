import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type SegmentedTab = {
  key: string;
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  iconFilled?: ComponentProps<typeof MaterialIcons>['name'];
  badge?: number;
};

const SegmentedTabs = ({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: SegmentedTab[];
  activeKey: string;
  onChange: (key: string) => void;
}) => {
  return (
    <View className="w-full bg-m3-surface-mid p-1 rounded-full flex-row items-center justify-between shadow-sm">
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 flex-row items-center justify-center gap-1.5 px-2 py-2 rounded-full ${
              active ? 'bg-m3-primary shadow-sm' : ''
            }`}
          >
            <MaterialIcons
              name={active && tab.iconFilled ? tab.iconFilled : tab.icon}
              size={18}
              color={active ? '#ffffff' : '#52443b'}
            />
            <Text
              className={`text-[12px] leading-4 font-semibold ${
                active ? 'text-m3-on-primary' : 'text-m3-on-surface-variant'
              }`}
            >
              {tab.label}
            </Text>
            {typeof tab.badge === 'number' ? (
              <View
                className={`ml-0.5 px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-m3-primary-container' : 'bg-m3-surface-highest'
                }`}
              >
                <Text
                  className={`text-[10px] leading-3 font-bold ${
                    active
                      ? 'text-m3-on-primary-container'
                      : 'text-m3-on-surface-variant'
                  }`}
                >
                  {tab.badge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SegmentedTabs;
