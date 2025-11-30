import { images } from "@/assets";
import { EPUBParser } from "@/lib/EPUBParser";
import { Link } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { Image, Text, TouchableWithoutFeedback, View } from "react-native";

type BookTileProps = {
  book: BookFile;
};



const BookTile = ({ book }: BookTileProps) => {

  const [cover, setCover] = useState(book.coverImage)

  useLayoutEffect(() => {
    const fetchCover = async ()=>{
      const parser = new EPUBParser(book.uri)
      const bookCover = await parser.getCoverImage()
      setCover(bookCover)
    }
  
    fetchCover()
  }, [cover])
  

  return (
    <Link
      href={{
        pathname: "/reader/[uri]",
        params: { uri: book.uri },
      }}
      asChild
      key={book.uri}
    >
      <TouchableWithoutFeedback className="">
        <View className="mb-4 w-full p-1">
          <Image
            source={
              cover
                ? { uri: cover as string }
                : images.COVER
            }
            resizeMode="cover"
            className="h-[270px] w-full rounded-3xl shadow-lg shadow-slate-400"
          />

          <View className="mt-6 px-4">
            <Text className="font-lato-black line-clamp-2 leading-snug tracking-wide">
              {book.title}
            </Text>
            <Text className="text-sm line-clamp-1 text-gray-600 leading-relaxed tracking-wide mt-2">
              {book.author}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Link>
  );
};

export default BookTile;
