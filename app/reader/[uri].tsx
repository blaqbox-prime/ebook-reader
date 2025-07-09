import { Reader, useReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { usePathname } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookReader = () => {

  const bookUri = usePathname().replace("/reader/",'').trim();
  const readerProps = useReader();

  // readerProps.changeFontSize("24px")


  return (
    <SafeAreaView className='flex flex-1'>
      <Reader
      src={bookUri} 
      fileSystem={useFileSystem} 
      allowPopups
      enableSelection
      flow='scrolled-continuous'
      snap
      />
    </SafeAreaView>
  )
}

export default BookReader