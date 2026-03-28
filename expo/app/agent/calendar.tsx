import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgentProfile } from '@/contexts/AgentProfileContext';

type ViewMode = 'week' | 'list';
type ModalMode = 'single' | 'bulk' | 'template' | null;

const TIME_TEMPLATES = [
  { name: 'Morning', start: '09:00', end: '12:00' },
  { name: 'Afternoon', start: '13:00', end: '17:00' },
  { name: 'Evening', start: '18:00', end: '21:00' },
  { name: 'Full Day', start: '09:00', end: '17:00' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, addBookingSlot, updateBookingSlot, deleteBookingSlot } = useAgentProfile();
  
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  
  const [bulkData, setBulkData] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[],
    startTime: '',
    endTime: '',
    slotDuration: '60',
    notes: '',
  });

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(currentWeekOffset), [currentWeekOffset]);

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return profile.bookingSlots.filter(
      slot => new Date(slot.date).toDateString() === dateStr
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleAddSlot = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    await addBookingSlot({
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes,
      booked: false,
    });

    setFormData({ date: '', startTime: '', endTime: '', notes: '' });
    setModalMode(null);
  };

  const handleBulkAddSlots = async () => {
    if (!bulkData.startDate || !bulkData.endDate || !bulkData.startTime || !bulkData.endTime || bulkData.daysOfWeek.length === 0) {
      return;
    }

    const start = new Date(bulkData.startDate);
    const end = new Date(bulkData.endDate);
    const duration = parseInt(bulkData.slotDuration);

    const slots = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (bulkData.daysOfWeek.includes(d.getDay())) {
        const [startHour, startMin] = bulkData.startTime.split(':').map(Number);
        const [endHour, endMin] = bulkData.endTime.split(':').map(Number);
        const dayStartMinutes = startHour * 60 + startMin;
        const dayEndMinutes = endHour * 60 + endMin;

        for (let minutes = dayStartMinutes; minutes < dayEndMinutes; minutes += duration) {
          const slotStartHour = Math.floor(minutes / 60);
          const slotStartMin = minutes % 60;
          const slotEndMinutes = Math.min(minutes + duration, dayEndMinutes);
          const slotEndHour = Math.floor(slotEndMinutes / 60);
          const slotEndMin = slotEndMinutes % 60;

          const startTimeStr = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
          const endTimeStr = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

          slots.push({
            date: new Date(d),
            startTime: startTimeStr,
            endTime: endTimeStr,
            notes: bulkData.notes,
            booked: false,
          });
        }
      }
    }

    for (const slot of slots) {
      await addBookingSlot(slot);
    }

    setBulkData({
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      startTime: '',
      endTime: '',
      slotDuration: '60',
      notes: '',
    });
    setModalMode(null);
  };

  const handleTemplateAdd = async (template: typeof TIME_TEMPLATES[0]) => {
    if (!formData.date) return;

    await addBookingSlot({
      date: new Date(formData.date),
      startTime: template.start,
      endTime: template.end,
      notes: formData.notes,
      booked: false,
    });

    setFormData({ date: '', startTime: '', endTime: '', notes: '' });
    setModalMode(null);
  };

  const handleEditSlot = async () => {
    if (!editingSlot) return;

    await updateBookingSlot(editingSlot, {
      date: formData.date ? new Date(formData.date) : undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      notes: formData.notes,
    });

    setEditingSlot(null);
    setFormData({ date: '', startTime: '', endTime: '', notes: '' });
    setModalMode(null);
  };

  const handleDeleteSlot = async (id: string) => {
    await deleteBookingSlot(id);
  };

  const openEditModal = (slot: any) => {
    setEditingSlot(slot.id);
    setModalMode('single');
    setFormData({
      date: slot.date ? new Date(slot.date).toISOString().split('T')[0] : '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: slot.notes || '',
    });
  };

  const toggleDayOfWeek = (day: number) => {
    setBulkData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const sortedSlots = [...profile.bookingSlots].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.startTime.localeCompare(b.startTime);
  });

  const groupSlotsByDate = () => {
    const groups: { [key: string]: typeof profile.bookingSlots } = {};
    sortedSlots.forEach(slot => {
      const dateKey = new Date(slot.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    });
    return groups;
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Calendar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'week' ? 'list' : 'week')}
          >
            <CalendarIcon size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setModalMode('single');
            setFormData({ ...formData, date: new Date().toISOString().split('T')[0] });
          }}
        >
          <Plus size={18} color={Colors.white} />
          <Text style={styles.quickActionText}>Single</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setModalMode('bulk')}
        >
          <Copy size={18} color={Colors.white} />
          <Text style={styles.quickActionText}>Bulk Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setModalMode('template');
            setFormData({ ...formData, date: new Date().toISOString().split('T')[0] });
          }}
        >
          <Zap size={18} color={Colors.white} />
          <Text style={styles.quickActionText}>Templates</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'week' ? (
          <View>
            <View style={styles.weekNavigation}>
              <TouchableOpacity
                style={styles.weekNavButton}
                onPress={() => setCurrentWeekOffset(currentWeekOffset - 1)}
              >
                <ChevronLeft size={24} color={Colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.weekTitle}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={styles.weekNavButton}
                onPress={() => setCurrentWeekOffset(currentWeekOffset + 1)}
              >
                <ChevronRight size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll}>
              {weekDates.map((date, index) => {
                const slots = getSlotsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <View key={index} style={styles.dayColumn}>
                    <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                      <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                        {WEEKDAYS[date.getDay()]}
                      </Text>
                      <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                        {date.getDate()}
                      </Text>
                    </View>
                    <ScrollView style={styles.daySlotsScroll} showsVerticalScrollIndicator={false}>
                      {slots.length === 0 ? (
                        <View style={styles.emptyDay}>
                          <Text style={styles.emptyDayText}>No slots</Text>
                          <TouchableOpacity
                            style={styles.addDayButton}
                            onPress={() => {
                              setModalMode('single');
                              setFormData({ ...formData, date: date.toISOString().split('T')[0] });
                            }}
                          >
                            <Plus size={16} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        slots.map(slot => (
                          <TouchableOpacity
                            key={slot.id}
                            style={[
                              styles.weekSlotCard,
                              slot.booked && styles.weekSlotCardBooked,
                            ]}
                            onPress={() => !slot.booked && openEditModal(slot)}
                            disabled={slot.booked}
                          >
                            <Text style={[styles.weekSlotTime, slot.booked && styles.weekSlotTimeBooked]}>
                              {slot.startTime}
                            </Text>
                            <Text style={[styles.weekSlotTime, slot.booked && styles.weekSlotTimeBooked]}>
                              {slot.endTime}
                            </Text>
                            {slot.booked && (
                              <View style={styles.bookedDot} />
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View>
            <View style={styles.infoCard}>
              <Clock size={24} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Quick Actions</Text>
                <Text style={styles.infoText}>
                  Use bulk add for recurring availability or templates for common time slots.
                </Text>
              </View>
            </View>

            {Object.keys(groupedSlots).length === 0 ? (
              <View style={styles.emptyState}>
                <CalendarIcon size={64} color={Colors.text.light} />
                <Text style={styles.emptyTitle}>No Slots Available</Text>
                <Text style={styles.emptyText}>
                  Create your first booking slot to let clients schedule appointments
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setModalMode('bulk')}
                >
                  <Copy size={20} color={Colors.white} />
                  <Text style={styles.emptyButtonText}>Set Weekly Hours</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.slotsContainer}>
                {Object.entries(groupedSlots).map(([dateKey, slots]) => (
                  <View key={dateKey} style={styles.dateGroup}>
                    <Text style={styles.dateHeader}>{dateKey}</Text>
                    {slots.map((slot) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.slotCard,
                          slot.booked && styles.slotCardBooked,
                        ]}
                      >
                        <View style={styles.slotLeft}>
                          <View style={styles.slotTimeContainer}>
                            <Clock size={18} color={slot.booked ? Colors.text.light : Colors.primary} />
                            <Text style={[styles.slotTime, slot.booked && styles.slotTimeBooked]}>
                              {slot.startTime} - {slot.endTime}
                            </Text>
                          </View>
                          {slot.notes && (
                            <Text style={styles.slotNotes} numberOfLines={2}>
                              {slot.notes}
                            </Text>
                          )}
                          {slot.booked && slot.bookedBy && (
                            <View style={styles.bookedBadge}>
                              <Check size={14} color={Colors.white} />
                              <Text style={styles.bookedText}>Booked by {slot.bookedBy}</Text>
                            </View>
                          )}
                        </View>
                        {!slot.booked && (
                          <View style={styles.slotActions}>
                            <TouchableOpacity
                              style={styles.slotActionButton}
                              onPress={() => openEditModal(slot)}
                            >
                              <Edit2 size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.slotActionButton}
                              onPress={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash2 size={18} color='#EF4444' />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={modalMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalMode(null);
          setEditingSlot(null);
          setFormData({ date: '', startTime: '', endTime: '', notes: '' });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'single' && editingSlot && 'Edit Slot'}
                {modalMode === 'single' && !editingSlot && 'Add Single Slot'}
                {modalMode === 'bulk' && 'Bulk Add Slots'}
                {modalMode === 'template' && 'Quick Templates'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalMode(null);
                  setEditingSlot(null);
                  setFormData({ date: '', startTime: '', endTime: '', notes: '' });
                }}
              >
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {modalMode === 'single' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.text.light}
                      value={formData.date}
                      onChangeText={(text) => setFormData({ ...formData, date: text })}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Start Time</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="09:00"
                        placeholderTextColor={Colors.text.light}
                        value={formData.startTime}
                        onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>End Time</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="10:00"
                        placeholderTextColor={Colors.text.light}
                        value={formData.endTime}
                        onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Add any notes or special instructions..."
                      placeholderTextColor={Colors.text.light}
                      value={formData.notes}
                      onChangeText={(text) => setFormData({ ...formData, notes: text })}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={editingSlot ? handleEditSlot : handleAddSlot}
                  >
                    <Text style={styles.submitButtonText}>
                      {editingSlot ? 'Update Slot' : 'Add Slot'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {modalMode === 'bulk' && (
                <>
                  <View style={styles.bulkInfo}>
                    <Clock size={20} color={Colors.primary} />
                    <Text style={styles.bulkInfoText}>
                      Quickly create recurring availability across multiple days
                    </Text>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Start Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={Colors.text.light}
                        value={bulkData.startDate}
                        onChangeText={(text) => setBulkData({ ...bulkData, startDate: text })}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>End Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={Colors.text.light}
                        value={bulkData.endDate}
                        onChangeText={(text) => setBulkData({ ...bulkData, endDate: text })}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Days of Week</Text>
                    <View style={styles.weekdaySelector}>
                      {WEEKDAYS.map((day, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.weekdayButton,
                            bulkData.daysOfWeek.includes(index) && styles.weekdayButtonActive,
                          ]}
                          onPress={() => toggleDayOfWeek(index)}
                        >
                          <Text
                            style={[
                              styles.weekdayButtonText,
                              bulkData.daysOfWeek.includes(index) && styles.weekdayButtonTextActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Start Time</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="09:00"
                        placeholderTextColor={Colors.text.light}
                        value={bulkData.startTime}
                        onChangeText={(text) => setBulkData({ ...bulkData, startTime: text })}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.label}>End Time</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="17:00"
                        placeholderTextColor={Colors.text.light}
                        value={bulkData.endTime}
                        onChangeText={(text) => setBulkData({ ...bulkData, endTime: text })}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Slot Duration (minutes)</Text>
                    <View style={styles.durationSelector}>
                      {['30', '60', '90', '120'].map(duration => (
                        <TouchableOpacity
                          key={duration}
                          style={[
                            styles.durationButton,
                            bulkData.slotDuration === duration && styles.durationButtonActive,
                          ]}
                          onPress={() => setBulkData({ ...bulkData, slotDuration: duration })}
                        >
                          <Text
                            style={[
                              styles.durationButtonText,
                              bulkData.slotDuration === duration && styles.durationButtonTextActive,
                            ]}
                          >
                            {duration}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Add any notes..."
                      placeholderTextColor={Colors.text.light}
                      value={bulkData.notes}
                      onChangeText={(text) => setBulkData({ ...bulkData, notes: text })}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleBulkAddSlots}
                  >
                    <Text style={styles.submitButtonText}>Create Slots</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalMode === 'template' && (
                <>
                  <View style={styles.bulkInfo}>
                    <Zap size={20} color={Colors.primary} />
                    <Text style={styles.bulkInfoText}>
                      Select a preset time slot for {formData.date ? new Date(formData.date).toLocaleDateString() : 'the selected date'}
                    </Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.text.light}
                      value={formData.date}
                      onChangeText={(text) => setFormData({ ...formData, date: text })}
                    />
                  </View>

                  <View style={styles.templatesGrid}>
                    {TIME_TEMPLATES.map((template, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.templateCard}
                        onPress={() => handleTemplateAdd(template)}
                      >
                        <Text style={styles.templateName}>{template.name}</Text>
                        <Text style={styles.templateTime}>
                          {template.start} - {template.end}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  viewToggle: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 10,
  },
  quickActions: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  weekNavigation: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
  },
  weekNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  weekScroll: {
    marginBottom: 20,
  },
  dayColumn: {
    width: 120,
    marginRight: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  dayHeader: {
    padding: 16,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray[50],
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[100],
  },
  dayHeaderToday: {
    backgroundColor: `${Colors.primary}10`,
    borderBottomColor: Colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  dayNameToday: {
    color: Colors.primary,
  },
  dayDate: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  dayDateToday: {
    color: Colors.primary,
  },
  daySlotsScroll: {
    maxHeight: 400,
    padding: 8,
  },
  emptyDay: {
    alignItems: 'center' as const,
    paddingVertical: 24,
    gap: 8,
  },
  emptyDayText: {
    fontSize: 12,
    color: Colors.text.light,
  },
  addDayButton: {
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 8,
  },
  weekSlotCard: {
    backgroundColor: `${Colors.primary}10`,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  weekSlotCardBooked: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[300],
  },
  weekSlotTime: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
    textAlign: 'center' as const,
  },
  weekSlotTimeBooked: {
    color: Colors.text.light,
  },
  bookedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    alignSelf: 'center' as const,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row' as const,
    backgroundColor: `${Colors.primary}10`,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: Colors.white,
    padding: 48,
    borderRadius: 20,
    alignItems: 'center' as const,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  slotsContainer: {
    gap: 24,
  },
  dateGroup: {
    gap: 12,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  slotCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gray[100],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  slotCardBooked: {
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[200],
  },
  slotLeft: {
    flex: 1,
    gap: 8,
  },
  slotTimeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  slotTimeBooked: {
    color: Colors.text.light,
  },
  slotNotes: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  bookedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start' as const,
  },
  bookedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  slotActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  slotActionButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top' as const,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  bulkInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: `${Colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  bulkInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  weekdaySelector: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  weekdayButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weekdayButtonActive: {
    backgroundColor: `${Colors.primary}10`,
    borderColor: Colors.primary,
  },
  weekdayButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  weekdayButtonTextActive: {
    color: Colors.primary,
  },
  durationSelector: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: `${Colors.primary}10`,
    borderColor: Colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.light,
  },
  durationButtonTextActive: {
    color: Colors.primary,
  },
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  templateTime: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
