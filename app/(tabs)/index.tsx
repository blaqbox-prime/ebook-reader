import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Button, ButtonText} from "@/components/ui/button";

export default function Index() {

  
  
  return (
    <SafeAreaView className='mx-4'>
      <View>
          <Text>List of Books</Text>
      </View>

       <Button >
           <ButtonText >Do something Here</ButtonText>
       </Button>

      <View>
      </View>
    </SafeAreaView>
  );
}
