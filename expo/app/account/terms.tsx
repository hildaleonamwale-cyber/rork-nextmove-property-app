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
import { ArrowLeft, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function TermsConditionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Shield size={32} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.headerCardTitle}>Terms & Conditions</Text>
          <Text style={styles.headerCardText}>
            Please read these terms carefully before using our services.
          </Text>
          <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>1. Acceptance of Terms</Text>
          </View>
          <Text style={styles.cardText}>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <FileText size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>2. Use License</Text>
          </View>
          <Text style={styles.cardText}>
            Permission is granted to temporarily download one copy of the materials on our application for personal, non-commercial transitory viewing only.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>3. User Accounts</Text>
          </View>
          <Text style={styles.cardText}>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <Shield size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>4. Privacy Policy</Text>
          </View>
          <Text style={styles.cardText}>
            Your use of our application is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <AlertCircle size={20} color="#EF4444" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>5. Prohibited Activities</Text>
          </View>
          <Text style={styles.cardText}>
            You may not access or use the application for any purpose other than that for which we make the application available. The application may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <FileText size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>6. Property Listings</Text>
          </View>
          <Text style={styles.cardText}>
            All property listings are provided for informational purposes only. We do not guarantee the accuracy, completeness, or reliability of any listings.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>7. Payment Terms</Text>
          </View>
          <Text style={styles.cardText}>
            All payments made through our application are subject to our payment processing terms. We are not responsible for any unauthorized transactions.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <AlertCircle size={20} color="#F59E0B" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>8. Limitation of Liability</Text>
          </View>
          <Text style={styles.cardText}>
            In no event shall we be liable for any damages arising out of the use or inability to use the materials on our application.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <FileText size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>9. Changes to Terms</Text>
          </View>
          <Text style={styles.cardText}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>10. Contact Information</Text>
          </View>
          <Text style={styles.cardText}>
            If you have any questions about these Terms & Conditions, please contact us at support@realestate.com
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  },
  headerCard: {
    backgroundColor: Colors.white,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  headerCardTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  headerCardText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 12,
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 13,
    color: Colors.text.light,
    fontStyle: 'italic' as const,
  },
  card: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  cardText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
});
