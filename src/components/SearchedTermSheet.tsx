import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { SearchResult as SearchResultType } from '@epubjs-react-native/core';
import SearchResult from '@/src/components/SearchResult';

type SearchedTermSheetProps = {
  isOpen: boolean;
  handleClose: () => void;
  reader: any;
  searchTerm: string;
};

const SearchedTermSheet = ({
  isOpen,
  handleClose,
  reader,
  searchTerm,
}: SearchedTermSheetProps) => {
  const {
    goToLocation,
    addAnnotation,
    removeAnnotationByCfi,
    clearSearchResults,
    isSearching,
    searchResults,
  } = reader;

  const [data, setData] = useState<SearchResultType[]>(searchResults.results);

  useEffect(() => {
    if (searchResults.results.length > 0) {
      setData(oldState => [...oldState, ...searchResults.results]);
    }
  }, [searchResults]);

  const renderItem = React.useCallback(
    ({ item }: { item: SearchResultType }) => (
      <SearchResult
        searchTerm={searchTerm}
        searchResult={item}
        onPress={searchResult => {
          goToLocation(searchResult.cfi);
          addAnnotation('highlight', searchResult.cfi);
          setTimeout(() => {
            removeAnnotationByCfi(searchResult.cfi);
          }, 3000);
          clearSearchResults();
          handleClose();
        }}
      />
    ),
    [
      addAnnotation,
      clearSearchResults,
      goToLocation,
      handleClose,
      removeAnnotationByCfi,
      searchTerm,
    ]
  );

  const header = () => (
    <>
      <View className="my-2 w-full">
        <Text className="text-2xl font-lato-bold text-white text-center mb-5">
          Search Results
        </Text>
      </View>

      {isSearching && (
        <View className="flex-1 w-full justify-between items-center my-2">
          <Text
            style={{
              fontStyle: 'italic',
              color: 'white',
            }}
          >
            Searching results...
          </Text>
        </View>
      )}
    </>
  );

  const empty = React.useCallback(
    () => (
      <View className="flex-1 w-full justify-between items-center my-2">
        <Text
          style={{
            fontStyle: 'italic',
            color: 'white',
          }}
        >
          No results...
        </Text>
      </View>
    ),
    []
  );

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose} snapPoints={[50]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-6 h-1/3 bg-app-ash-brown-800">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item.cfi.concat(index.toString())}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          style={{ width: '100%' }}
          //   maxToRenderPerBatch={20}
          //   onEndReachedThreshold={0.2}
          //   onEndReached={fetchMoreData}
        />
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default SearchedTermSheet;
