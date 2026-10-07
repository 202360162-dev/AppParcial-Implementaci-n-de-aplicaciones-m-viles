import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectProductModal from '../components/SelectProductModal';

export default function CalculatorScreen() {
  const STORAGE_KEY = '@local_inventory';
  const HISTORY_KEY = '@sales_history'; // Nueva llave para el historial
  const [cart, setCart] = useState([]); 
  const [cash, setCash] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState('0'); 
  const [modalVisible, setModalVisible] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const itemPriceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
    return sum + (itemPriceWithDiscount * item.cartQty);
  }, 0);

  const finalTotal = subtotal * (1 - parseFloat(globalDiscount || 0) / 100);
  const change = parseFloat(cash || 0) - finalTotal;

  const clearCurrentSale = () => {
    setCart([]);
    setCash('');
    setGlobalDiscount('0');
  };

  const handleSelectProduct = (product, qtyToAdd) => {
    if (qtyToAdd <= 0) { Alert.alert("Error", "Ingresa cantidad válida"); return; }
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQty = existingItem.cartQty + qtyToAdd;
      if (newQty > product.stock) { Alert.alert("Stock insuficiente", `Solo tienes ${product.stock}`); return; }
      setCart(cart.map(item => item.id === product.id ? { ...item, cartQty: newQty } : item));
    } else {
      if (qtyToAdd > product.stock) { Alert.alert("Stock insuficiente", `Solo tienes ${product.stock}`); return; }
      setCart([...cart, { ...product, cartQty: qtyToAdd }]);
    }
  };

  const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));

  const handleCompleteSale = async () => {
    if (cart.length === 0) { Alert.alert("Error", "Ticket vacío."); return; }
    if (change < 0 && cash !== '') { Alert.alert("Atención", "Falta efectivo."); return; }

    const efIngresado = parseFloat(cash || 0);
    const cambioFinal = change;

    // 1. Crear el registro del ticket
    const newSaleRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(), // Ej: "15/10/2023, 14:30:00"
      items: cart,
      total: finalTotal,
      cash: efIngresado,
      change: cambioFinal
    };

    try {
      // 2. Descontar del inventario
      const storedInv = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedInv) {
        let inventory = JSON.parse(storedInv);
        cart.forEach(cItem => {
          inventory = inventory.map(iItem => iItem.id === cItem.id ? { ...iItem, stock: Math.max(0, iItem.stock - cItem.cartQty) } : iItem);
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      }

      // 3. Guardar en el Historial de Compras
      const storedHist = await AsyncStorage.getItem(HISTORY_KEY);
      const historyArray = storedHist ? JSON.parse(storedHist) : [];
      historyArray.push(newSaleRecord);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyArray));

    } catch (e) { console.error(e); }

    clearCurrentSale();
    Alert.alert("¡Venta Exitosa!", `Cambio a devolver: $${efIngresado ? cambioFinal.toFixed(2) : '0.00'}\nStock y Registro actualizados.`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F8FAFC' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Caja Registradora</Text>
        
        <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.selectButtonText}>+ Agregar Producto al Ticket</Text>
        </TouchableOpacity>

        <View style={styles.cartContainer}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>Ticket vacío. Agrega productos.</Text>
            ) : (
              cart.map((item, index) => {
                const itemFP = item.price * (1 - (item.discount || 0) / 100);
                return (
                  <View key={index} style={styles.cartItem}>
                    <View style={{flex: 1}}>
                      <Text style={styles.cartItemName}>{item.cartQty}x {item.name}</Text>
                      {item.discount > 0 && <Text style={styles.cartItemDiscount}>Desc: -{item.discount}%</Text>}
                    </View>
                    <Text style={styles.cartItemPrice}>${(itemFP * item.cartQty).toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}><Text style={styles.deleteBtnText}>X</Text></TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        <View style={styles.checkoutBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Desc. Global (%):</Text>
            <TextInput style={styles.smallInput} keyboardType="numeric" value={globalDiscount} onChangeText={setGlobalDiscount} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Efectivo Recibido ($):</Text>
            <TextInput style={styles.smallInput} keyboardType="numeric" placeholder="0.00" value={cash} onChangeText={setCash} />
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total a Cobrar: ${finalTotal.toFixed(2)}</Text>
            {cash !== '' && <Text style={[styles.changeText, { color: change >= 0 ? '#16A34A' : '#DC2626' }]}>Cambio: ${change >= 0 ? change.toFixed(2) : 'Falta dinero'}</Text>}
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={clearCurrentSale}><Text style={styles.payButtonText}>Vaciar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.payButton} onPress={handleCompleteSale}><Text style={styles.payButtonText}>Completar Venta</Text></TouchableOpacity>
          </View>
        </View>

      </ScrollView>
      <SelectProductModal visible={modalVisible} onClose={() => setModalVisible(false)} onSelectProduct={handleSelectProduct} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flexGrow: 1, paddingBottom: 60 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  selectButton: { backgroundColor: '#3B82F6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  selectButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  cartContainer: { flex: 1, minHeight: 150, backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyCart: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cartItemName: { fontSize: 15, fontWeight: 'bold', color: '#334155' },
  cartItemDiscount: { fontSize: 12, color: '#DC2626' },
  cartItemPrice: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginRight: 15 },
  deleteBtn: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold' },
  checkoutBox: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 8, elevation: 3, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569' },
  smallInput: { borderWidth: 1, borderColor: '#CBD5E1', padding: 8, borderRadius: 6, width: 80, textAlign: 'right', color: '#1E293B' },
  totalBox: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  totalText: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
  changeText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.35, marginRight: 10 },
  payButton: { backgroundColor: '#16A34A', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.65 },
  payButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});