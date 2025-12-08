import {Manager, Reader, ReaderProvider, useReader} from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useLocalSearchParams, usePathname } from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import ReaderOptionsFAB, {ReaderOptionsActionSheet} from "@/components/ReaderOptionsFAB";

const BookReader = () => {
    const { uri } = useLocalSearchParams();
    const [showFab, setShowFab] = useState<boolean>(true)
    const toggleFab = () => {
        setShowFab(prev => !prev)
        console.log(showFab)
    }
    const [showActionsheet, setShowActionsheet] = React.useState(false);
    const handleClose = () => setShowActionsheet(false);
    const reader = useReader()


    useEffect(() => {
        reader.changeTheme({
            "body" : {
                backgroundColor: "black"
            }
        })
    }, []);

  return (
    <SafeAreaView className="flex flex-1 relative bg-white">
      <ReaderProvider >
        <Reader
          src={uri as string}
          fileSystem={useFileSystem}
          allowPopups
          enableSelection
          flow="scrolled-continuous"



        />

          <ReaderOptionsFAB showFab={showFab} setShowActionSheet={setShowActionsheet}/>
          <ReaderOptionsActionSheet showActionsheet={showActionsheet} handleClose={handleClose} reader={reader}/>

      </ReaderProvider>
    </SafeAreaView>
  );
};

export default BookReader;
