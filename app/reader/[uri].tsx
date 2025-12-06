import { Reader, ReaderProvider, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useLocalSearchParams, usePathname } from "expo-router";
import React, {useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import ReaderOptionsFAB from "@/components/ReaderOptionsFAB";

const BookReader = () => {
const { uri } = useLocalSearchParams();
const [showFab, setShowFab] = useState<boolean>(true)

    const toggleFab = () => {
        setShowFab(prev => !prev)
        console.log(showFab)
    }

  return (
    <SafeAreaView className="flex flex-1 relative bg-white">
      <ReaderProvider>
        <Reader
          src={uri as string}
          fileSystem={useFileSystem}
          allowPopups
          enableSelection
          flow="scrolled-continuous"
          snap
          // onSingleTap={() => toggleFab()}

        />

          <ReaderOptionsFAB showFab={showFab}/>

      </ReaderProvider>
    </SafeAreaView>
  );
};

export default BookReader;
