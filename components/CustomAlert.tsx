import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, onClose }: CustomAlertProps) {
  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertContainer: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      minWidth: 300,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    button: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}





