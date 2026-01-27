import {Text, TouchableOpacity} from 'react-native'
import {ReactElement} from 'react'

type CustomButtonProps = {
    icon?: ReactElement,
    text?: string
    onPress: () => void
}

const CustomButton = ({icon, text, onPress} : CustomButtonProps) => {
    return (
        <TouchableOpacity className="flex-row items justify-center gap-4 bg-primary-100 py-4 px-6 rounded-full" onPress={onPress}>
            <Text className="text-white font-lato-bold text-xl">{text}</Text>
            {icon && icon}
        </TouchableOpacity>
    )
}
export default CustomButton
