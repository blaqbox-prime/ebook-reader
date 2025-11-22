import { images } from "@/assets";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, TouchableWithoutFeedback, View } from "react-native";

type BookTileProps = {
  book: BookFile;
};

const BookTile = ({ book }: BookTileProps) => {
  return (
    <Link
      href={{
        pathname: "/reader/[uri]",
        params: { uri: book.uri },
      }}
      asChild
      key={book.uri}
    >
      <TouchableWithoutFeedback className="w-[50%] mb-6">
        <View className="mb-4 w-full p-2">
          <Image
            source={
              book.coverImage
                ? { uri: book.coverImage as string }
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
