import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const TOCActionSheet = ({
  isOpen,
  handleClose,
  toc,
  reader,
}: {
  toc: any[];
  isOpen: boolean;
  handleClose: () => void;
  reader: any;
}) => {
  const handleChapterSelect = (href: any) => {
    reader.goToLocation(href.href);
    handleClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[50]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-6 h-1/3 bg-app-taupe-grey-900">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="my-2 w-full">
          <Text className="text-2xl font-lato-bold text-white text-center mb-5">
            Table Of Contents
          </Text>
        </View>

        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {toc.length > 0 ? (
            toc.map((item, i) => (
              <TouchableOpacity
                onPress={() => handleChapterSelect(item)}
                key={i}
                className={`p-2 mb-2 border-primary-500 w-full`}
              >
                <Text className="items-start text-white text-lg">
                  {item.label.trim()}
                </Text>
                <View className="h-[2px] w-full bg-primary-500 opacity-10 mt-1"></View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>TOC Unavailable</Text>
          )}
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};
