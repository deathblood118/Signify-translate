import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TranslateApp from './src/TranslateApp';
import DemoPage from './src/DemoPage';
import Settings from './src/Settings'; // Make sure the file is named Settings.js

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="TranslateApp" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TranslateApp" component={TranslateApp} />
          <Stack.Screen name="DemoPage" component={DemoPage} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});