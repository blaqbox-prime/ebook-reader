import { EPUBParser } from '@/src/utils';
import React, { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const CustomEpubReader = ({ bookUri }: { bookUri: string }) => {
  const [parser, setParser] = useState<EPUBParser | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterHtml, setChapterHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initParser = async () => {
      try {
        setLoading(true);
        const newParser = new EPUBParser(bookUri);
        await newParser.parse();
        setParser(newParser);

        // Load the first chapter in the spine
        const firstChapter = await newParser.getChapterContent(
          newParser['spine'][0].href
        );
        setChapterHtml(firstChapter);
      } catch (e) {
        console.error('Failed to initialize EPUB:', e);
      } finally {
        setLoading(false);
      }
    };
    initParser();
  }, [bookUri]);

  const navigateChapter = async (direction: 'next' | 'prev') => {
    if (!parser) return;

    const nextIndex =
      direction === 'next' ? currentChapterIndex + 1 : currentChapterIndex - 1;
    const spine = parser['spine'];

    if (nextIndex >= 0 && nextIndex < spine.length) {
      setLoading(true);
      const content = await parser.getChapterContent(spine[nextIndex].href);
      setChapterHtml(content);
      setCurrentChapterIndex(nextIndex);
      setLoading(false);
    }
  };

  // This memoized HTML wraps the chapter content with styles and scripts
  const finalHtml = useMemo(() => {
    if (!chapterHtml) return '';

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, sans-serif; 
              padding: 20px 20px 80px 20px; 
              font-size: 18px; line-height: 1.6; color: #333;
              background-color: #fdfaf3; /* Eye-friendly book color */
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>${chapterHtml}</body>
      </html>
    `;
  }, [chapterHtml]);

  if (loading && !chapterHtml) {
    return (
      <ActivityIndicator size="large" color="#FFD700" style={{ flex: 1 }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fdfaf3' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: finalHtml }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        textZoom={100}
      />

      {/* Navigation Overlay */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#eee',
        }}
      >
        <TouchableOpacity
          onPress={() => navigateChapter('prev')}
          disabled={currentChapterIndex === 0}
        >
          <Text style={{ color: currentChapterIndex === 0 ? '#ccc' : '#000' }}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text>Chapter {currentChapterIndex + 1}</Text>

        <TouchableOpacity onPress={() => navigateChapter('next')}>
          <Text style={{ color: '#000' }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomEpubReader;
