import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductModal from '../components/ProductModal';
import { useIsFocused } from '@react-navigation/native'; // Para recargar al entrar a la pantalla

export default function InventoryScreen() {
  const STORAGE_KEY = '@local_inventory';
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadProducts();
  }, [isFocused]);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setProducts(JSON.parse(stored));
    } catch (e) { console.error(e); }
  };

  const saveProduct = async (product) => {
    try {
      let updated;
      if (productToEdit) {
        // Actualizar existente
        updated = products.map(p => p.id === product.id ? product : p);
      } else {
        // Agregar nuevo
        updated = [...products, product];
      }
      setProducts(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProductToEdit(null);
    } catch (e) { console.error(e); }
  };

  const openNewModal = () => {
    setProductToEdit(null);
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openNewModal}>
        <Text style={styles.addButtonText}>+ Agregar Producto Local</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const hasDiscount = item.discount && item.discount > 0;
          const finalPrice = item.price * (1 - (item.discount || 0) / 100);

          return (
            <TouchableOpacity style={styles.itemCard} onPress={() => openEditModal(item)}>
              <View style={{flex: 1}}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemStock}>Stock: {item.stock}</Text>
                {hasDiscount && <Text style={styles.itemDiscountTag}>Promo: -{item.discount}%</Text>}
              </View>
              <View style={{alignItems: 'flex-end'}}>
                {hasDiscount && <Text style={styles.oldPrice}>${item.price.toFixed(2)}</Text>}
                <Text style={styles.itemPrice}>${finalPrice.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <ProductModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={saveProduct} initialData={productToEdit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  addButton: { backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  itemCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemStock: { fontSize: 14, color: '#64748B' },
  itemDiscountTag: { fontSize: 12, color: '#FFFFFF', backgroundColor: '#DC2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  oldPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  itemPrice: { fontSize: 18, fontWeight: 'bold', color: '#16A34A' },
});