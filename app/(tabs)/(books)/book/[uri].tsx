import { fetchGoogleBookMetadata } from "@/api";
import { images } from "@/assets";
import { colors } from "@/constants/constants";
import Book from "@/db/models/Book";
import Metadata from "@/db/models/Metadata";
import { createNewMetadata, fetchBookByUri, fetchMetadataByUri } from "@/db/queries";
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";



const BookDetails = () => {
    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const [metadata, setMetadata] = useState<any>(null)
    const {uri} = useLocalSearchParams()
    const navigator = useNavigation()
    const router = useRouter()

    useEffect(() => {
        const getBookDetails = async () => {
           let bookInfo = await fetchBookByUri(uri as string);
           if(bookInfo[0]){
               setBook(bookInfo[0])

               let metaInfo: Metadata[] = await fetchMetadataByUri(uri as string)
               let googleBooksMetaInfo: MetadataInfo | null;
               if(metaInfo.length === 0){
                   googleBooksMetaInfo = await fetchGoogleBookMetadata("",bookInfo[0].title)
                   if(googleBooksMetaInfo){
                       const metadata = await createNewMetadata(uri as string, googleBooksMetaInfo)
                       setMetadata(metadata)
                   }
               }
               else {
                   setMetadata(metaInfo[0])
               }
           }
           else {
               navigator.goBack()
           }
        }

        getBookDetails()
        setLoading(false)
    }, [uri, navigator])


    if(loading) return <Text>Loading...</Text>

    return (
        <SafeAreaView className="px-8 py-6">
            <ScrollView>
            {/* Top Bar */}
                <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => {navigator.goBack()}}>
                        <Feather name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <View className="flex flex-row items-center gap-4">
                        <TouchableOpacity onPress={() => {}}>
                            <Feather name="menu" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

            {/*  Image  */}
                <View className="mt-12 pb-4">
                    <Image
                        source={
                            book?.coverImage
                                ? { uri: book?.coverImage as string }
                                : metadata?.coverImage ? {uri: metadata?.coverImage} : images.COVER
                        }
                        resizeMode="cover"
                        className="h-[370px] w-[250px] rounded-lg mx-auto shadow-lg"
                    />
                    <Text className="text-center mt-8 line-clamp-2 font-lato-bold text-3xl">
                        {book?.title}
                    </Text>
                    <Text className="text-center mt-4 font-body text-xl text-secondary-100">
                        {book?.creator}
                    </Text>
                {/*  progress indicator  */}
                    <View className="w-7/12 h-[4px] rounded-full bg-slate-300 mx-auto mt-4">
                        <View className="bg-background-dark h-1 rounded-full origin-left w-[24%]"></View>
                    </View>
                    <Text className="text-center mt-2 text-typography-500">24% completed</Text>
                </View>

                      <View className="my-8">
                          <View className="mx-auto p-4 bg-amber-900 w-1/2 rounded-full">
                              <View className="mx-auto">
                                  <TouchableOpacity className="flex-row items justify-center gap-4" onPress={() => {
                                    router.push({
                                        pathname: `/reader/[uri]`,
                                        params: {uri: uri as string}
                                    })
                                  }}>
                                      <Text className="text-white font-lato-bold text-xl">Read Book</Text>
                                      <Feather name="book-open" size={24} color={colors.light} />
                                  </TouchableOpacity>

                              </View>
                          </View>
                      </View>

            {/*  Metadata  */}

                {metadata && (<View className="mb-20">
                    <Text className="text-2xl mb-2 font-lato-bold" style={{color: colors.dark}}>Summary</Text>
                    <Text className="leading-8">
                        {metadata.description}
                    </Text>
                </View>)}

            </ScrollView>
        </SafeAreaView>
    )
}
    export default BookDetails
