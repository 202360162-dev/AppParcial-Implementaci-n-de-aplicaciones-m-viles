import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreenComponent({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onFinish();
      }, 1500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>TiendaLocal Pro</Text>
        <Text style={styles.subtitle}>Gestión y Utilidad Offline</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  box: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8' },
});