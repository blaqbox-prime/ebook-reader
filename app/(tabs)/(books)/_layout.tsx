import {View, Text} from 'react-native'
import {Stack} from "expo-router";

type Props = {};
const Layout = (props: Props) => {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="/(tabs)/(books)/index" />
            <Stack.Screen name="/(tabs)/(books)/[uri]"/>
        </Stack>
    );
};
export default Layout;
