import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreenComponent from './src/components/SplashScreenComponent';
import DrawerNavigator from './src/navigation/DrawerNavigator';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  if (!isSplashFinished) {
    return <SplashScreenComponent onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}