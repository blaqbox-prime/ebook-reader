import { colors } from '@/src/constants';
import {
  SearchResult as SearchResultType,
  useReader,
} from '@epubjs-react-native/core';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  searchTerm: string;
  searchResult: SearchResultType;
  onPress: (searchResult: SearchResultType) => void;
}

function SearchResult({ searchTerm, searchResult, onPress }: Props) {
  const { theme } = useReader();

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = searchResult.excerpt.split(regex);
  return (
    <TouchableOpacity
      key={searchResult.cfi}
      style={styles.container}
      onPress={() => onPress(searchResult)}
    >
      <View style={styles.icon}>
        <Feather name="book" color={colors.graphite[400]} size={20} />

        {/* <Text style={styles.bookmarkLocationNumber} variant="labelSmall">
          {location}
        </Text> */}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={{ ...styles.chapter, color: 'white' }}>
          Chapter: {searchResult.section?.label}
        </Text>

        <View>
          <Text
            style={{
              ...styles.excerpt,
              color: 'white',
            }}
            onPress={() => {
              onPress(searchResult);
            }}
          >
            &quot;
            {parts.filter(String).map((part, index) => {
              return regex.test(part) ? (
                <Text style={styles.highlight} key={`${index}-part-highlight`}>
                  {part}
                </Text>
              ) : (
                <Text key={`${index}-part`} style={{ color: 'white' }}>
                  {part}
                </Text>
              );
            })}
            &quot;
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    width: '85%',
  },
  chapter: { marginBottom: 2 },
  excerpt: { fontStyle: 'italic' },
  highlight: { backgroundColor: colors.graphite[400] },
});

export default SearchResult;
