/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import AppNavigator from './navigation/AppNavigation'

import { init } from './helpers/db';

init().then(() => {
  console.log('Db Initialized')
}).catch(err => {
  console.log('Db Failed to mount...');
  throw err;
})

const App = (props) => {
  return (
    <AppNavigator />
  )
};

export default App;
