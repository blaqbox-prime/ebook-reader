import { preferencesStorage, watermelondb } from "@/src/data";
import { Button, Text, TextInput, View } from "react-native";



export default function Index() {

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        padding: "24",
        gap: 10,
      }}
    >
      <Button title="Get Posts" />
      <Button title="Make Comment" />


    </View>
  );
}
