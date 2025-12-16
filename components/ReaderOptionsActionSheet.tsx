import {useState} from "react";
import {useReader} from "@epubjs-react-native/core";
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent, ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper, ActionsheetItem
} from "@/components/ui/actionsheet";
import {colors} from "@/constants/constants";
import ReaderTypographyOptions from "@/components/ReaderTypographyOptions";
import ReaderOptionsSwiper from "@/components/ReaderOptionsSwiper";
import ReaderBrightnessOptions from "@/components/ReaderBrightnessOptions";
import ReaderNavigationOptions from "@/components/ReaderNavigationOptions";
import {View} from "react-native";

type ReaderOptionsActionSheetProps = {
    showActionsheet: boolean;
    handleClose: () => void
    selectedFontSize?: "small" | "medium" | "large"
    setTheme: any
    reader: any
    activeSlide: number
}

const ReaderOptionsActionSheet = ({reader, showActionsheet, handleClose, setTheme, activeSlide, selectedFontSize = "small"}: ReaderOptionsActionSheetProps) => {
    return (
        <Actionsheet isOpen={showActionsheet} onClose={handleClose} snapPoints={[35]}>
            <ActionsheetBackdrop />
            <ActionsheetContent className="p-6 h-1/3" style={{backgroundColor: colors.dark}} >
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>


                    <ReaderOptionsSwiper activeSlide={activeSlide}>
                        <ReaderTypographyOptions selectedFontSize={selectedFontSize} setTheme={setTheme}/>
                        <ReaderBrightnessOptions />
                        <ReaderNavigationOptions reader={reader}/>
                    </ReaderOptionsSwiper>


            </ActionsheetContent>
        </Actionsheet>
    )
}

export default ReaderOptionsActionSheet