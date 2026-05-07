import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const theme = useColorScheme() ?? 'light';

  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: theme === 'dark' ? '#9BA1A6' : '#687076',
        tabBarStyle: {
            backgroundColor: Colors[theme].background, 
            borderTopColor: theme === 'dark' ? '#333' : '#eee',
        },
        headerStyle: {
            backgroundColor: Colors[theme].background, 
        },
        headerTintColor: Colors[theme].text,
    }}>
      <Tabs.Screen name="index" options={{ title: "Ma Biblio" }} />
      <Tabs.Screen name="scanner" options={{ title: "Scanner" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
    </Tabs>
  );
}

