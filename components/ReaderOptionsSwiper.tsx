import {View, Text} from 'react-native'
import React from 'react'
import Swiper from 'react-native-swiper'

const ReaderOptionsSwiper = ({children, activeSlide}: {children: React.ReactNode, activeSlide: number}) => {
    return (
        <Swiper showsButtons={false} >
            {children}
        </Swiper>
    )
}
export default ReaderOptionsSwiper
