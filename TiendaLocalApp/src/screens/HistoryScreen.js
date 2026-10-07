import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

export default function HistoryScreen() {
  const HISTORY_KEY = '@sales_history';
  const [history, setHistory] = useState([]);
  const isFocused = useIsFocused();

  // Recarga el historial cada vez que entras a la pantalla
  useEffect(() => {
    if (isFocused) loadHistory();
  }, [isFocused]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        // Ordenamos para que el más reciente salga arriba
        const parsedHistory = JSON.parse(stored).reverse();
        setHistory(parsedHistory);
      } else {
        setHistory([]);
      }
    } catch (e) { console.error(e); }
  };

  const clearHistory = () => {
    Alert.alert(
      "Borrar Historial",
      "¿Estás seguro de que quieres eliminar todos los registros de ventas? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar Todo", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(HISTORY_KEY);
            setHistory([]);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Ventas Realizadas</Text>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <Text style={styles.clearBtnText}>Vaciar</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>Aún no has realizado ninguna venta.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketDate}>{item.date}</Text>
                <Text style={styles.ticketTotal}>Total: ${item.total.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.itemsTitle}>Productos vendidos:</Text>
              {item.items.map((prod, idx) => (
                <Text key={idx} style={styles.itemText}>
                  • {prod.cartQty}x {prod.name}
                </Text>
              ))}

              <View style={styles.ticketFooter}>
                <Text style={styles.footerText}>Efectivo: ${item.cash.toFixed(2)}</Text>
                <Text style={styles.footerText}>Cambio: ${item.change.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#F8FAFC' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  clearBtn: { backgroundColor: '#EF4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  clearBtnText: { color: '#FFF', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 40, fontSize: 16 },
  
  ticketCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, elevation: 2, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ticketDate: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  ticketTotal: { fontSize: 18, fontWeight: 'bold', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  itemsTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 5 },
  itemText: { fontSize: 14, color: '#475569', marginLeft: 5, marginBottom: 2 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  footerText: { fontSize: 13, color: '#64748B' }
});