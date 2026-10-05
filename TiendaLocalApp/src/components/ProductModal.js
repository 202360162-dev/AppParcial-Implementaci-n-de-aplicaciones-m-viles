import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductModal({ visible, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('0'); // Nuevo campo de descuento individual

  // Si pasamos un producto para editar, llenamos los campos
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setStock(initialData.stock.toString());
      setDiscount(initialData.discount ? initialData.discount.toString() : '0');
    } else {
      setName(''); setPrice(''); setStock(''); setDiscount('0');
    }
  }, [initialData, visible]);

  const handleSave = () => {
    if (!name || !price || !stock) return;
    onSave({ 
      id: initialData ? initialData.id : Date.now().toString(), 
      name, 
      price: parseFloat(price), 
      stock: parseInt(stock),
      discount: parseFloat(discount || 0)
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{initialData ? "Editar Producto" : "Nuevo Producto"}</Text>
          
          <TextInput placeholder="Nombre del producto" placeholderTextColor="#94A3B8" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Precio base ($)" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
          <TextInput placeholder="Stock disponible" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} />
          <TextInput placeholder="Descuento individual (%)" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" value={discount} onChangeText={setDiscount} />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}><Text style={styles.btnText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}><Text style={styles.btnText}>Guardar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1E293B' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 10, borderRadius: 8, marginBottom: 12, color: '#1E293B' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  btnCancel: { backgroundColor: '#64748B' },
  btnSave: { backgroundColor: '#2563EB' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold' },
});