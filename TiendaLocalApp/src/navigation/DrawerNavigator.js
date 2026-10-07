import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CalculatorScreen from '../screens/CalculatorScreen';
import InventoryScreen from '../screens/InventoryScreen';
import HistoryScreen from '../screens/HistoryScreen'; // Importamos la nueva pantalla

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#1E293B' }, 
        headerTintColor: '#FFFFFF',
        drawerStyle: { backgroundColor: '#FFFFFF' },
        drawerActiveTintColor: '#3B82F6',
        drawerInactiveTintColor: '#64748B'
      }}
    >
      <Drawer.Screen name="Calculadora de Caja" component={CalculatorScreen} />
      <Drawer.Screen name="Inventario Local" component={InventoryScreen} />
      <Drawer.Screen name="Historial de Ventas" component={HistoryScreen} />
    </Drawer.Navigator>
  );
}