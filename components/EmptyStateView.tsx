import React, {ReactElement} from 'react'
import { Image, ImageSourcePropType, Text, View } from 'react-native'
import CustomButton from "@/components/CustomButton";

type EmptyStateViewProps = {
    message: string | undefined,
    image: ImageSourcePropType,
    showButton?: boolean
    buttonText?: string
    buttonAction?: () => void
    buttonIcon?: ReactElement
}

const EmptyStateView = ({message, image, showButton, buttonText, buttonAction, buttonIcon}:EmptyStateViewProps) => {
  return (
    <View className="items-center justify-center gap-4 h-[60vh] ">
                <View>
                  <Image
                  source={image}
                  style={{ height: 200, objectFit: "scale-down", marginInline: "auto"}}
                  className="mx-auto"
                />
                </View>
                <Text className="text-dark text-xl font-bold">
                  {message}
                </Text>

        {showButton &&
            (<View className={"mt-4"}>
                <CustomButton onPress={buttonAction || (() => {})}
                    text={buttonText || ""}
                    icon={buttonIcon || (<></>)}
                />
            </View>)}

              </View>
  )
}

export default EmptyStateView