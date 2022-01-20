import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CameraScreen from './components/CameraScreen';
import Navbar from './components/Navbar';
import SavedDocuments from './components/SavedDocuments';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();


export default function App() {

  return (
    <View style={styles.container}>
      <StatusBar hidden={true}/>
      <Navbar style={styles.navbar} />
        <View style={styles.body}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Camera Screen'>
              <Stack.Screen name='Camera Screen' component={CameraScreen}/>
              <Stack.Screen name='Documents Screen' component={SavedDocuments}/>
            </Stack.Navigator>
          </NavigationContainer>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  navbar: {
    flex: 2
  },
  body: {
    flex: 8
  }
});
