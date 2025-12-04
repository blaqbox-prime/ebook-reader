import { Reader, ReaderProvider, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useLocalSearchParams, usePathname } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const BookReader = () => {
const { uri } = useLocalSearchParams();  
const readerProps = useReader();

  // readerProps.changeFontSize("24px")

  return (
    <SafeAreaView className="flex flex-1">
      <ReaderProvider>
        <Reader
          src={uri as string}
          fileSystem={useFileSystem}
          allowPopups
          enableSelection
          flow="scrolled-continuous"
          snap
        />
      </ReaderProvider>
    </SafeAreaView>
  );
};

export default BookReader;
