import { Reader, Theme, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import ReaderOptionsActionSheet from "@/components/ReaderOptionsActionSheet";
import ReaderOptionsFAB from "@/components/ReaderOptionsFAB";
import Book from "@/db/models/Book";
import { fetchBookByUri } from "@/db/queries";

const BookReader = () => {
    const { uri } = useLocalSearchParams();
    const [showFab, setShowFab] = useState(true);
    const [showActionsheet, setShowActionsheet] = useState(false);

    const reader = useReader()
    const [activeTheme, setActiveTheme] = useState<Theme>(reader.theme)
    const [activeSlide, setActiveSlide] = useState(0)
    const [book, setBook] = useState<Book | null>(null)
    
    useEffect(() => {
        const getBook = async () => {
            const activeBook = await fetchBookByUri(uri as string)
            setBook(activeBook[0])
        }
        getBook()
    },[])

    return (
        <SafeAreaView className="flex flex-1 bg-white">
                <Reader
                    defaultTheme={reader.theme}                     // <-- IMPORTANT
                    src={uri as string}
                    fileSystem={useFileSystem}
                    allowPopups
                    enableSelection
                    flow="scrolled-continuous"
                    initialLocation={book?.lastLocation ? JSON.parse(book?.lastLocation).start.cfi : undefined}
                    onLocationChange={(totalLocations, current,progress,) => {
                        if(book){
                            // update the last location
                            book.updateLastLocation(JSON.stringify(current))
                            book.updateProgress(Math.round((current.start.location/totalLocations) * 100))
                        }
                    }}

                />

                <ReaderOptionsFAB
                    showFab={showFab}
                    setShowActionSheet={setShowActionsheet}
                    reader={reader}
                    setActiveSlide={setActiveSlide}
                />

                <ReaderOptionsActionSheet
                    showActionsheet={showActionsheet}
                    handleClose={() => setShowActionsheet(false)}
                    setTheme={setActiveTheme}
                    reader={reader}
                    activeSlide={activeSlide}
                />

                

        </SafeAreaView>
    );
};

export default BookReader;
