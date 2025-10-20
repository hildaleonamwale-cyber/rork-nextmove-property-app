import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface DateTimePickerModalProps {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
}

export default function DateTimePickerModal({
  visible,
  mode,
  value,
  onConfirm,
  onCancel,
  minimumDate,
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(value);

  if (Platform.OS === 'web') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onCancel}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              {mode === 'date' ? (
                <Calendar size={24} color={Colors.primary} />
              ) : (
                <Clock size={24} color={Colors.primary} />
              )}
              <Text style={styles.title}>
                {mode === 'date' ? 'Select Date' : 'Select Time'}
              </Text>
            </View>
            
            <input
              type={mode === 'date' ? 'date' : 'time'}
              value={
                mode === 'date'
                  ? selectedDate.toISOString().split('T')[0]
                  : selectedDate.toTimeString().split(' ')[0].substring(0, 5)
              }
              onChange={(e) => {
                if (mode === 'date') {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                } else {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(selectedDate);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setSelectedDate(newDate);
                }
              }}
              style={{
                padding: 16,
                fontSize: 16,
                borderRadius: 12,
                border: `1.5px solid ${Colors.gray[200]}`,
                backgroundColor: Colors.gray[50],
                width: '100%',
              }}
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => onConfirm(selectedDate)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <View style={styles.nativeContainer}>
          <View style={styles.nativeHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.nativeTitle}>
              {mode === 'date' ? 'Select Date' : 'Select Time'}
            </Text>
            <TouchableOpacity onPress={() => onConfirm(selectedDate)}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            display="spinner"
            onChange={(event, date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            minimumDate={minimumDate}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%' as const,
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  nativeContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%' as const,
    maxWidth: 400,
    overflow: 'hidden' as const,
  },
  nativeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  nativeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
