import React, { useState, useEffect } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectProductModal({ visible, onClose, onSelectProduct }) {
  const STORAGE_KEY = '@local_inventory';
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // Guarda las cantidades escritas para cada producto

  useEffect(() => {
    if (visible) {
      loadProducts();
      setQuantities({}); // Limpia las cantidades al abrir el modal
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

  const handleAdd = (item) => {
    // Si no escribió nada, por defecto es 1 unidad
    const qtyToAdd = parseInt(quantities[item.id]) || 1;
    onSelectProduct(item, qtyToAdd);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Producto</Text>
          
          {products.length === 0 ? (
            <Text style={styles.emptyText}>No hay productos en el inventario.</Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled" // Permite tocar los botones sin que el teclado estorbe
              renderItem={({ item }) => (
                <View style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productStock}>Stock: {item.stock} | Precio: ${item.price.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.actionRow}>
                    <TextInput 
                      style={styles.qtyInput}
                      keyboardType="numeric"
                      placeholder="1"
                      value={quantities[item.id]}
                      onChangeText={(text) => setQuantities({ ...quantities, [item.id]: text })}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
                      <Text style={styles.addBtnText}>Añadir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  modalContent: { width: '95%', maxHeight: '85%', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1E293B', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#64748B', marginVertical: 20 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  productInfo: { flex: 1, paddingRight: 10 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  productStock: { fontSize: 13, color: '#64748B' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  qtyInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 8, width: 50, textAlign: 'center', marginRight: 8, color: '#1E293B' },
  addBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  closeBtn: { backgroundColor: '#64748B', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  closeBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});