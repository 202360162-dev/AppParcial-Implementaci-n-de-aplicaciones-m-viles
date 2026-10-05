import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CalculatorScreen from '../screens/CalculatorScreen';
import InventoryScreen from '../screens/InventoryScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1E293B' }, headerTintColor: '#FFFFFF' }}>
      <Drawer.Screen name="Calculadora de Caja" component={CalculatorScreen} />
      <Drawer.Screen name="Inventario Local" component={InventoryScreen} />
    </Drawer.Navigator>
  );
}