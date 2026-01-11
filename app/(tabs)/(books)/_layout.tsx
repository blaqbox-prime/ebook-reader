import { Stack } from "expo-router";

type Props = {};
const Layout = (props: Props) => {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="book/[uri]" />
        </Stack>
    );
};
export default Layout;
