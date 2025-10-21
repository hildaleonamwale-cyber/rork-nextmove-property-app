import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  Linking,
  Share,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  Calendar as CalendarIcon,
  MessageCircle,
  Phone,
  Share2,
  Heart,
  Eye,
  Clock,
  Wifi,
  Car,
  Wind,
  Droplets,
  Zap,
  Shield,
  MessageSquare,
  TrendingUp,
  Users,
  MapIcon,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { mockProperties, mockAgents, mockAgencies, mockStands, mockCommercialProperties } from '@/mocks/properties';
import { Listing, Property, Stand, CommercialProperty } from '@/types/property';
import ConfirmDialog from '@/components/ConfirmDialog';
import SuccessPrompt from '@/components/SuccessPrompt';
import { useBookings } from '@/contexts/BookingContext';
import { useSupabaseProperty } from '@/hooks/useSupabaseProperties';

const { width } = Dimensions.get('window');

const WhatsAppIcon = ({ size = 22, color = '#25D366' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      fill={color}
    />
  </Svg>
);

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addBooking } = useBookings();

  const propertyId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { property: propertyData, isLoading } = useSupabaseProperty(propertyId);

  const listing = propertyData;
  const agent = mockAgents.find((a) => a.id === listing?.agentId);
  const agency = mockAgencies.find((ag) => ag.id === agent?.agencyId);
  
  const isStand = listing?.listingCategory === 'stand';
  const isCommercial = listing?.listingCategory === 'commercial';
  const property = listing as Property | undefined;
  const stand = listing as Stand | undefined;
  const commercial = listing as CommercialProperty | undefined;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showBookConfirm, setShowBookConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  const generateCalendarDays = () => {
    const days: { date: Date; available: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date,
        available: Math.random() > 0.3,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const amenityIcons: { [key: string]: React.ComponentType<any> } = {
    'Parking': Car,
    'Gym': Users,
    'Pool': Droplets,
    'Security': Shield,
    'Garden': Wind,
    'Smart Home': Zap,
    'Fireplace': TrendingUp,
    'Wine Cellar': Droplets,
    'Concierge': MessageSquare,
    'Rooftop Terrace': Wind,
    'Wi-Fi': Wifi,
    'Wifi': Wifi,
    'High-Speed Internet': Wifi,
    'HVAC': Wind,
    'Air Conditioning': Wind,
    'Reception Area': MessageSquare,
    'Conference Rooms': Users,
    'Loading Docks': Car,
    'Three-Phase Power': Zap,
    'Highway Access': MapIcon,
    'Office Space': MessageSquare,
    'Security System': Shield,
    'Storefront Windows': Sparkles,
    'High Foot Traffic': Users,
    'Storage Area': Shield,
    'Kitchenette': Droplets,
    'Meeting Room': Users,
    'Open Floor Plan': Sparkles,
    'Exposed Brick': TrendingUp,
    'Heavy Power Supply': Zap,
    'Overhead Cranes': TrendingUp,
    'Loading Zones': Car,
    'Industrial Zoning': Shield,
    'Laundry': Droplets,
    'Storage': Shield,
    'Garage': Car,
    'Basement': Shield,
    'Waterfront': Droplets,
    'Dock': MapIcon,
    'Deck': Wind,
    'Level Terrain': MapIcon,
    'Corner Stand': MapIcon,
    'Mature Trees': Wind,
    'Gated Community': Shield,
    'Prime Location': MapIcon,
    'High Traffic Area': Users,
    'Corner Plot': MapIcon,
    'Commercial Zoning': Shield,
    'Scenic Views': Eye,
    'Sloped Terrain': MapIcon,
    'Quiet Location': Shield,
    'Established Area': Shield,
    'Fertile Soil': Wind,
    'Water Access': Droplets,
    'Road Frontage': MapIcon,
    'Fenced': Shield,
    'Level Ground': MapIcon,
    'New Development': Sparkles,
    'Paved Roads': MapIcon,
    'Street Lighting': Sparkles,
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${listing.title}`;
    const phone = agent?.phone?.replace(/\D/g, '') || '1234567890';
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  const handleCall = () => {
    const phone = agent?.phone || '+263 77 123 4567';
    Linking.openURL(`tel:${phone}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing property: ${listing.title} - ${listing.price.toLocaleString()} ${listing.priceType === 'monthly' ? '/month' : ''}`,
        url: Platform.OS === 'web' ? window.location.href : undefined,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleBookTour = () => {
    if (!selectedDate || !selectedTime) return;
    setShowBookConfirm(true);
  };

  const confirmBookTour = async () => {
    setShowBookConfirm(false);
    
    if (!selectedDate || !selectedTime) return;

    const booking = await addBooking({
      propertyId: listing.id,
      propertyTitle: listing.title,
      propertyImage: listing.images[0],
      date: selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: selectedTime,
      clientName: 'John Doe',
    });
    
    console.log('Tour booking created:', booking);
    
    setSuccessMessage('Tour Booked Successfully!');
    setShowSuccess(true);
    
    setSelectedDate(null);
    setSelectedTime('');
    setBookingNotes('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: listing.images[selectedImageIndex] }} style={styles.mainImage} />
            
            <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.white} />
              </TouchableOpacity>
              
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={() => setIsLiked(!isLiked)}>
                  <Heart size={22} color={Colors.white} fill={isLiked ? Colors.white : 'transparent'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                  <Share2 size={22} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.imageOverlay}>
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {selectedImageIndex + 1} / {listing.images.length}
                </Text>
              </View>
            </View>
            <View style={styles.thumbnailsOverlay}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.thumbnailsContent}
              >
                {listing.images.map((image: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive,
                    ]}
                  >
                    <Image source={{ uri: image }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              listing.status === 'For Rent' ? styles.rentBadge : styles.saleBadge,
            ]}>
              <Text style={styles.statusText}>{listing.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${listing.price.toLocaleString()}
              {listing.priceType === 'monthly' && (
                <Text style={styles.priceType}> /month</Text>
              )}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.location}>
              {listing.location.address}, {listing.location.city}, {listing.location.country}
            </Text>
          </View>

          {isStand ? (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Maximize2 size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{stand?.area.toLocaleString()} m²</Text>
              </View>

              {stand?.titleDeeds && (
                <View style={styles.statCard}>
                  <CheckCircle2 size={16} color={Colors.success} strokeWidth={2} />
                  <Text style={styles.statText}>Title Deeds</Text>
                </View>
              )}

              {stand?.serviced && (
                <View style={styles.statCard}>
                  <Shield size={16} color={Colors.primary} strokeWidth={2} />
                  <Text style={styles.statText}>Serviced</Text>
                </View>
              )}
            </View>
          ) : isCommercial ? (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Maximize2 size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{commercial?.area.toLocaleString()} m²</Text>
              </View>

              <View style={styles.statCard}>
                <Car size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{commercial?.parkingSpaces} Parking</Text>
              </View>

              <View style={styles.statCard}>
                <Users size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{commercial?.floors} Floors</Text>
              </View>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Bed size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{property?.bedrooms} Beds</Text>
              </View>

              <View style={styles.statCard}>
                <Bath size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{property?.bathrooms} Baths</Text>
              </View>

              <View style={styles.statCard}>
                <Maximize2 size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>{property?.area}m²</Text>
              </View>

              <View style={styles.statCard}>
                <Car size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.statText}>1 Garage</Text>
              </View>
            </View>
          )}



          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <View style={styles.descriptionIconCircle}>
                <MessageSquare size={20} color={Colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.sectionTitle}>About {isStand ? 'Land' : isCommercial ? 'Commercial Property' : 'Property'}</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          </View>

          {isStand && stand?.developerSession && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionSection}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Developer Session</Text>
                </View>
                <View style={styles.descriptionCard}>
                  <Text style={styles.description}>{stand.developerSession}</Text>
                </View>
              </View>
            </>
          )}

          {isStand && stand?.landFeatures && stand.landFeatures.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.amenitiesSection}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Land Features</Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {stand.landFeatures.map((feature, index) => {
                    const IconComponent = amenityIcons[feature] || Wifi;
                    return (
                      <View key={index} style={styles.amenityCard}>
                        <View style={styles.amenityIconContainer}>
                          <IconComponent size={20} color={Colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.amenityText}>{feature}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {isCommercial && commercial?.features && commercial.features.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.amenitiesSection}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Features & Amenities</Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {commercial.features.map((feature, index) => {
                    const IconComponent = amenityIcons[feature] || Wifi;
                    return (
                      <View key={index} style={styles.amenityCard}>
                        <View style={styles.amenityIconContainer}>
                          <IconComponent size={20} color={Colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.amenityText}>{feature}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {!isStand && !isCommercial && property?.amenities && (
            <>
              <View style={styles.divider} />
              <View style={styles.amenitiesSection}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Amenities & Features</Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || Wifi;
                    return (
                      <View key={index} style={styles.amenityCard}>
                        <View style={styles.amenityIconContainer}>
                          <IconComponent size={20} color={Colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.analyticsSection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{isStand ? 'Land' : isCommercial ? 'Commercial Property' : 'Property'} Insights</Text>
            </View>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Eye size={18} color={Colors.primary} strokeWidth={2.5} />
                <Text style={styles.analyticsValue}>{listing.views}</Text>
                <Text style={styles.analyticsLabel}>Views</Text>
              </View>
              <View style={styles.analyticsCard}>
                <CalendarIcon size={18} color={Colors.success} strokeWidth={2.5} />
                <Text style={styles.analyticsValue}>{listing.bookings}</Text>
                <Text style={styles.analyticsLabel}>Bookings</Text>
              </View>
              <View style={styles.analyticsCard}>
                <MessageCircle size={18} color={Colors.accent} strokeWidth={2.5} />
                <Text style={styles.analyticsValue}>{listing.inquiries}</Text>
                <Text style={styles.analyticsLabel}>Inquiries</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.agentSection}>
            <Text style={styles.agentSectionTitle}>Listing Agent</Text>
            
            {agent && (
              <View style={styles.agentCardWrapper}>
                <TouchableOpacity 
                  style={styles.agentCard} 
                  onPress={() => router.push(`/profile/${agent.id}?type=agent`)}
                  activeOpacity={0.92}
                >
                  <View style={styles.agentLeftSection}>
                    <View style={styles.agentImageContainer}>
                      <Image source={{ uri: agent.avatar }} style={styles.agentImage} />
                    </View>
                    
                    <View style={styles.agentInfoSection}>
                      <Text style={styles.agentName} numberOfLines={1}>
                        {agent.name}
                      </Text>
                      <Text style={styles.agentTitle} numberOfLines={1}>
                        {agent.title}
                      </Text>
                      {agency && (
                        <View style={styles.companyInfo}>
                          <Image source={{ uri: agency.logo }} style={styles.companyLogo} />
                          <Text style={styles.companyName} numberOfLines={1}>
                            {agency.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.agentActionsSection}>
                    <TouchableOpacity 
                      style={styles.agentActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCall();
                      }}
                    >
                      <Phone size={20} color={Colors.white} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.agentActionButtonSecondary}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleWhatsApp();
                      }}
                    >
                      <WhatsAppIcon size={20} color="#25D366" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.bookingSection}>
            <View style={styles.sectionHeader}>
              <CalendarIcon size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Book a Tour</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Select a date and time for your {isStand ? 'land' : isCommercial ? 'commercial property' : 'property'} viewing</Text>

            <View style={styles.calendarContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarContent}>
                {calendarDays.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      !day.available && styles.dayButtonDisabled,
                      isDateSelected(day.date) && styles.dayButtonSelected,
                    ]}
                    onPress={() => day.available && setSelectedDate(day.date)}
                    disabled={!day.available}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day.available && styles.dayTextDisabled,
                        isDateSelected(day.date) && styles.dayTextSelected,
                      ]}
                    >
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text
                      style={[
                        styles.dateText,
                        !day.available && styles.dateTextDisabled,
                        isDateSelected(day.date) && styles.dateTextSelected,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.monthText,
                        !day.available && styles.monthTextDisabled,
                        isDateSelected(day.date) && styles.monthTextSelected,
                      ]}
                    >
                      {day.date.toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedDate && (
              <>
                <Text style={styles.timeSectionTitle}>Select Time</Text>
                <View style={styles.timeSlots}>
                  {timeSlots.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeButton,
                        selectedTime === time && styles.timeButtonSelected,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Clock
                        size={16}
                        color={selectedTime === time ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === time && styles.timeTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.noteLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Let us know if you have any special requirements..."
                  placeholderTextColor={Colors.text.light}
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'web' ? 20 : insets.bottom + 20 }]}>
        <View style={styles.footerContent}>
          <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/chat')}>
            <MessageCircle size={22} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <WhatsAppIcon size={22} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Phone size={22} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookButton, (!selectedDate || !selectedTime) && styles.bookButtonDisabled]}
            disabled={!selectedDate || !selectedTime}
            onPress={handleBookTour}
          >
            <Text style={styles.bookButtonText}>Book Tour</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmDialog
        visible={showBookConfirm}
        title="Confirm Booking"
        message={`Book a tour for ${selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${selectedTime}?`}
        confirmText="Yes, Book"
        cancelText="Cancel"
        onConfirm={confirmBookTour}
        onCancel={() => setShowBookConfirm(false)}
        confirmColor={Colors.primary}
      />

      <SuccessPrompt
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: Colors.white,
  },
  imageContainer: {
    width: width,
    height: 450,
    position: 'relative' as const,
    backgroundColor: Colors.black,
  },
  mainImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  imageOverlay: {
    position: 'absolute' as const,
    bottom: 120,
    right: 16,
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  thumbnailsOverlay: {
    position: 'absolute' as const,
    bottom: 42,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  thumbnailsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden' as const,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  infoSection: {
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  statusRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
    alignItems: 'center' as const,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rentBadge: {
    backgroundColor: Colors.primary,
  },
  saleBadge: {
    backgroundColor: Colors.accent,
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },

  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    lineHeight: 36,
  },
  priceRow: {
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  priceType: {
    fontSize: 20,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: Colors.text.secondary,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 28,
  },
  statCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  statText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 28,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },

  descriptionSection: {
    marginBottom: 24,
  },
  descriptionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  descriptionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 18,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text.secondary,
    letterSpacing: 0.1,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  amenityCard: {
    width: (width - 60) / 3,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center' as const,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  amenityIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    lineHeight: 14,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsGrid: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center' as const,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  analyticsLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },

  bookingSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarContent: {
    paddingRight: 20,
  },
  dayButton: {
    width: 75,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: Colors.gray[50],
    alignItems: 'center' as const,
    marginRight: 12,
    gap: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  dayTextDisabled: {
    color: Colors.text.light,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  dateTextDisabled: {
    color: Colors.text.light,
  },
  dateTextSelected: {
    color: Colors.white,
  },
  monthText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  monthTextDisabled: {
    color: Colors.text.light,
  },
  monthTextSelected: {
    color: Colors.white,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  timeSlots: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
  },
  timeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[100],
  },
  timeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  timeTextSelected: {
    color: Colors.white,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    textAlignVertical: 'top' as const,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)' as any,
    borderTopWidth: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  footerContent: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    alignItems: 'center' as const,
  },
  contactButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  agentSection: {
    marginBottom: 24,
  },
  agentSectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  agentCardWrapper: {
    marginTop: 4,
  },
  agentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  agentLeftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    flex: 1,
  },
  agentImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden' as const,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  agentImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  agentInfoSection: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  agentTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  companyInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 4,
  },
  companyLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  agentActionsSection: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  agentActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  agentActionButtonSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

});
