import { View, Text, FlatList } from 'react-native';
import React, { useEffect } from 'react';
import SessionTrackingService from '@/src/services/SessionTrackingService';
import ReadingSession from '@/src/Models/ReadingSession';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const [sessions, setSessions] = React.useState<ReadingSession[]>([]);

  const fetchSessions = async () => {
    const service: SessionTrackingService = new SessionTrackingService();
    const allSessions = await service.getAllSessions();
    setSessions(allSessions);
  };

  useEffect(() => {
    fetchSessions();
  });

  return (
    <SafeAreaView className="mx-8">
      <Text className="font-body text-5xl my-12">Profile</Text>
      <FlatList
        data={sessions}
        renderItem={({ item }) => (
          <View className="p-4 mb-4">
            <Text className="font-body my-2">{item.id}</Text>
            <Text className="font-body">
              {item.timeStart.toLocaleDateString()}
            </Text>
            <Text className="font-body">
              {item.duration.toFixed(2)} seconds
            </Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

export default Profile;
