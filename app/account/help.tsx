import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const faqItems = [
    { question: 'How do I book a property?', category: 'Booking' },
    { question: 'How do I cancel a reservation?', category: 'Booking' },
    { question: 'What payment methods are accepted?', category: 'Payment' },
    { question: 'How do I become an agent?', category: 'Account' },
    { question: 'How do I contact property owners?', category: 'General' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
                <Mail size={20} color="#10B981" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactDescription}>support@realestate.com</Text>
              </View>
              <ChevronRight size={20} color={Colors.text.light} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#F59E0B15' }]}>
                <Phone size={20} color="#F59E0B" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone Support</Text>
                <Text style={styles.contactDescription}>+1 (800) 123-4567</Text>
              </View>
              <ChevronRight size={20} color={Colors.text.light} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.card}>
            {faqItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity style={styles.faqItem}>
                  <View style={styles.faqContent}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Text style={styles.faqCategory}>{item.category}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.text.light} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginLeft: 70,
  },
  faqItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
