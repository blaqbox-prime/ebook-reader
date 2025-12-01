import { images } from "@/assets";
import { EPUBParser } from "@/lib/EPUBParser";
import { Link } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { Image, Text, TouchableWithoutFeedback, View } from "react-native";
import Book from "@/db/models/Book";

type BookTileProps = {
  book: Book;
};



const BookTile = ({ book }: BookTileProps) => {

  const [cover, setCover] = useState(book.coverImage);


  return (
    <Link
      href={{
        pathname: "/(tabs)/(books)/book/[uri]",
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
            className="h-[270px] w-full rounded-xl "
          />

          <View className="mt-6 px-4">
            <Text className="font-lato-black line-clamp-2 leading-snug tracking-wide">
              {book.title}
            </Text>
            <Text className="text-sm line-clamp-2 text-gray-600 leading-relaxed tracking-wide mt-2">
              {book.creator}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Link>
  );
};

export default BookTile;
