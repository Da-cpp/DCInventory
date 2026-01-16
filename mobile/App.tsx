/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;









import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, useColorScheme } from 'react-native';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import DashboardScreen from './DashboardScreen'; 

const Stack = createNativeStackNavigator();

function App() {

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;









// import * as React from 'react';
// import { View, Text, StyleSheet, StatusBar, useColorScheme } from 'react-native';

// // NOTE: We are NOT importing React Navigation yet!

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     // 1. We replace the NavigationContainer with a basic View
//     <View style={styles.container}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
//       {/* 2. Display a confirmation message */}
//       <Text style={styles.title}>JS Code is Working!</Text>
//       <Text>Your environment is stable. The issue is with the navigation code.</Text>

//       {/* 3. We will try to load the crashing component here */}
//       <NavigationTest /> 
//     </View>
//   );
// }

// // New component to isolate the crashing imports
// function NavigationTest() {
//     // We will put the problematic imports *inside* the function
//     try {
//         const { NavigationContainer } = require('@react-navigation/native');
//         const { createNativeStackNavigator } = require('@react-navigation/native-stack');
//         // ... (rest of the navigation setup would go here)

//         return <Text style={styles.success}>Navigation Imports Loaded!</Text>;

//     } catch (e) {
//         // If the native module fails to load, the require will throw an error
//         console.error("Navigation Load Failed:", e);
//         return <Text style={styles.failure}>Native Linking Failure: Restart Required!</Text>;
//     }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   success: {
//     marginTop: 20,
//     color: 'green',
//   },
//   failure: {
//     marginTop: 20,
//     color: 'red',
//     textAlign: 'center',
//   }
// });

// export default App;
