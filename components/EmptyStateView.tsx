import React from 'react'
import { Image, ImageSourcePropType, Text, View } from 'react-native'

type EmptyStateViewProps = {
    message: string | undefined,
    image: ImageSourcePropType
}

const EmptyStateView = ({message, image}:EmptyStateViewProps) => {
  return (
    <View className="items-center justify-center gap-4 -h-screen-safe-offset-72">
                <View>
                  <Image
                  source={image}
                  style={{ height: 200, objectFit: "scale-down", marginInline: "auto"}}
                  className="mx-auto bg-pink"
                />
                </View>
                <Text className="text-dark text-xl font-bold">
                  {message}
                </Text>
              </View>
  )
}

export default EmptyStateView