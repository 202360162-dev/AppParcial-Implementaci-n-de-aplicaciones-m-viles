import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectProductModal from '../components/SelectProductModal';

export default function CalculatorScreen() {
  const STORAGE_KEY = '@local_inventory';
  const [cart, setCart] = useState([]); // Arreglo para múltiples productos
  const [cash, setCash] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState('0'); // Descuento general
  const [modalVisible, setModalVisible] = useState(false);

  // Calcular subtotal sumando cada producto con su descuento individual aplicado
  const subtotal = cart.reduce((sum, item) => {
    const itemPriceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
    return sum + (itemPriceWithDiscount * item.cartQty);
  }, 0);

  // Aplicar descuento global sobre el subtotal
  const finalTotal = subtotal * (1 - parseFloat(globalDiscount || 0) / 100);
  const change = parseFloat(cash || 0) - finalTotal;

  const handleSelectProduct = (product) => {
    // Buscar si ya está en el carrito
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.cartQty >= product.stock) {
        Alert.alert("Stock insuficiente", "No puedes agregar más unidades de este producto.");
        return;
      }
      // Aumentar cantidad
      setCart(cart.map(item => item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item));
    } else {
      if (product.stock < 1) {
        Alert.alert("Agotado", "Este producto no tiene stock disponible.");
        return;
      }
      // Agregar nuevo al carrito con cantidad 1
      setCart([...cart, { ...product, cartQty: 1 }]);
    }
  };

const handleCompleteSale = async () => {
  if (cart.length === 0) {
    Alert.alert("Error", "El ticket está vacío.");
    return;
  }

  if (change < 0 && cash !== '') {
    Alert.alert("Atención", "Falta efectivo para cubrir el total.");
    return;
  }

  const cambioFinal = change;
  const efectivoIngresado = cash;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      let inventory = JSON.parse(stored);
      cart.forEach(cartItem => {
        inventory = inventory.map(invItem => {
          if (invItem.id === cartItem.id) {
            return { ...invItem, stock: Math.max(0, invItem.stock - cartItem.cartQty) };
          }
          return invItem;
        });
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  } catch (e) {
    console.error(e);
  }

  clearCurrentSale();

  Alert.alert(
    "¡Venta Exitosa!",
    `Cambio a devolver: $${efectivoIngresado ? cambioFinal.toFixed(2) : '0.00'}\nStock actualizado.`
  );
};

const clearCurrentSale = () => {
  setCart([]);
  setCash('');
  setGlobalDiscount('0');
};

const removeFromCart = (productId) => {
  setCart(prevCart => prevCart.filter(item => item.id !== productId));
};

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Caja Registradora</Text>
      
      <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectButtonText}>+ Agregar Producto al Ticket</Text>
      </TouchableOpacity>

      {/* Lista del Carrito */}
      <View style={styles.cartContainer}>
        <ScrollView nestedScrollEnabled>
          {cart.length === 0 ? (
            <Text style={styles.emptyCart}>Ticket vacío. Agrega productos.</Text>
          ) : (
            cart.map((item, index) => {
              const itemFinalPrice = item.price * (1 - (item.discount || 0) / 100);
              return (
                <View key={index} style={styles.cartItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.cartItemName}>{item.cartQty}x {item.name}</Text>
                    {item.discount > 0 && <Text style={styles.cartItemDiscount}>Descuento ind: -{item.discount}%</Text>}
                  </View>
                  <Text style={styles.cartItemPrice}>${(itemFinalPrice * item.cartQty).toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Resumen y Cobro */}
      <View style={styles.checkoutBox}>
        <View style={styles.row}>
          <Text style={styles.label}>Desc. Global de Ticket (%):</Text>
          <TextInput style={styles.smallInput} keyboardType="numeric" value={globalDiscount} onChangeText={setGlobalDiscount} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Efectivo Recibido ($):</Text>
          <TextInput style={styles.smallInput} keyboardType="numeric" placeholder="0.00" value={cash} onChangeText={setCash} />
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total a Cobrar: ${finalTotal.toFixed(2)}</Text>
          {cash !== '' && (
            <Text style={[styles.changeText, { color: change >= 0 ? '#16A34A' : '#DC2626' }]}>
              Cambio: ${change >= 0 ? change.toFixed(2) : 'Falta dinero'}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handleCompleteSale}>
          <Text style={styles.payButtonText}>Completar Venta</Text>
        </TouchableOpacity>
      </View>

      <SelectProductModal visible={modalVisible} onClose={() => setModalVisible(false)} onSelectProduct={handleSelectProduct} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#F8FAFC', flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  selectButton: { backgroundColor: '#3B82F6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  selectButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  cartContainer: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyCart: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cartItemName: { fontSize: 15, fontWeight: 'bold', color: '#334155' },
  cartItemDiscount: { fontSize: 12, color: '#DC2626' },
  cartItemPrice: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginRight: 15 },
  deleteBtn: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold' },

  checkoutBox: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569' },
  smallInput: { borderWidth: 1, borderColor: '#CBD5E1', padding: 8, borderRadius: 6, width: 80, textAlign: 'right' },
  totalBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  totalText: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  changeText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  payButton: { backgroundColor: '#16A34A', padding: 15, borderRadius: 8, alignItems: 'center' },
  payButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});