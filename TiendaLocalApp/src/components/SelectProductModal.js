import React, { useState, useEffect } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectProductModal({ visible, onClose, onSelectProduct }) {
  const STORAGE_KEY = '@local_inventory';
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setProducts(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Producto</Text>
          
          {products.length === 0 ? (
            <Text style={styles.emptyText}>No hay productos en el inventario local.</Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.productItem} 
                  onPress={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                >
                  <View>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productStock}>Stock: {item.stock} | Precio: ${item.price.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.selectText}>Elegir</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1E293B', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#64748B', marginVertical: 20 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  productStock: { fontSize: 13, color: '#64748B' },
  selectText: { color: '#2563EB', fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#64748B', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  closeBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});