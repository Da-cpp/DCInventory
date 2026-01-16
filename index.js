// /**
//  * @format
//  */

import { AppRegistry } from 'react-native';
import App from './App.tsx';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);



// import {AppRegistry} from 'react-native';
// import App from './App'; // <-- MUST point to the App.js file
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);



// import {AppRegistry} from 'react-native';
// import {name as appName} from './app.json';
// import React from 'react';
// import { View, Text } from 'react-native';

// // Define a simple, unbreakable component right here
// const SimpleTest = () => (
//     <View style={{ flex: 1, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}>
//         <Text style={{ fontSize: 30, color: 'white' }}>HELLO</Text>
//     </View>
// );

// // Register the SimpleTest instead of App
// AppRegistry.registerComponent(appName, () => SimpleTest);



// import {AppRegistry} from 'react-native';
// import App from './App'; // <-- MUST be pointing to './App' 
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);
