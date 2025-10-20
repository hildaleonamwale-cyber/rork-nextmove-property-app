import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  UserPlus,
  MessageCircle,
  Share2,
  Users,
  Briefcase,
  Languages,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { mockAgents, mockAgencies, mockProperties } from '@/mocks/properties';
import PropertyCard from '@/components/PropertyCard';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import SectionHeader from '@/components/SectionHeader';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const { profile: agentProfile } = useAgentProfile();

  const [isFollowing, setIsFollowing] = useState(false);

  const isAgency = type === 'agency';
  const agent = mockAgents.find((a) => a.id === id);
  const agency = mockAgencies.find((ag) => ag.id === id || ag.id === agent?.agencyId);

  const profile = isAgency ? agency : agent;
  const displayAgency = isAgency ? agency : mockAgencies.find((ag) => ag.id === agent?.agencyId);

  const featuredCards = isAgency && agency?.profileCards ? agency.profileCards : (isAgency ? agentProfile.profileCards : []);

  const properties = mockProperties.filter((p) => {
    if (isAgency) {
      return agency?.staff.some((s) => s.id === p.agentId);
    }
    return p.agentId === id;
  });

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  const banner = (isAgency ? agency?.banner : agent?.banner) || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200';
  const avatar = isAgency ? agency?.logo : agent?.avatar;
  const name = isAgency ? agency?.name : agent?.name;
  const bio = profile.bio || (isAgency ? agency?.description : agent?.title) || '';
  const followers = isAgency ? agency?.followers : agent?.followers;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerSection}>
          <Image source={{ uri: banner }} style={styles.bannerImage} />
          <View style={[styles.bannerOverlay, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.bannerActions}>
              <TouchableOpacity style={styles.bannerButton}>
                <Share2 size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              {isAgency && <Building2 size={24} color={Colors.primary} />}
            </View>

            {!isAgency && agent?.title && (
              <Text style={styles.title}>{agent.title}</Text>
            )}

            {displayAgency && !isAgency && (
              <TouchableOpacity
                style={styles.agencyLink}
                onPress={() => router.push(`/profile/${displayAgency.id}?type=agency`)}
              >
                <Building2 size={16} color={Colors.primary} />
                <Text style={styles.agencyLinkText}>{displayAgency.name}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MapPin size={18} color={Colors.primary} />
                <Text style={styles.statValue}>{properties.length}</Text>
                <Text style={styles.statLabel}>Properties</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Users size={18} color={Colors.primary} />
                <Text style={styles.statValue}>{followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <UserPlus size={20} color={isFollowing ? Colors.primary : Colors.white} />
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.messageButton} onPress={() => router.push('/chat')}>
                <MessageCircle size={20} color={Colors.white} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bioSection}>
            <SectionHeader
              title="About"
              style={{ paddingHorizontal: 0, marginBottom: 8 }}
            />
            <Text style={styles.bioText}>{bio}</Text>
          </View>

          {isAgency && featuredCards && featuredCards.length > 0 && (
            <View style={styles.cardsSection}>
              <SectionHeader
                icon={Sparkles}
                title="Featured Properties"
                subtitle="Discover our premium listings"
                style={{ paddingHorizontal: 0, marginBottom: 12 }}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
                snapToInterval={width - 60}
                decelerationRate="fast"
                pagingEnabled={false}
                style={{ marginHorizontal: -20 }}
              >
                {featuredCards
                  .sort((a, b) => a.order - b.order)
                  .map((card, index) => (
                    <View key={card.id} style={[styles.profileCard, index === 0 && styles.firstCard]}>
                      <Image source={{ uri: card.image }} style={styles.profileCardImage} />
                      <View style={styles.profileCardContent}>
                        <Text style={styles.profileCardTitle} numberOfLines={2}>{card.title}</Text>
                        {card.description && (
                          <Text style={styles.profileCardDescription} numberOfLines={2}>
                            {card.description}
                          </Text>
                        )}
                        <TouchableOpacity
                          style={styles.profileCardCta}
                          onPress={() => {
                            if (card.propertyId) {
                              router.push({ pathname: '/property/[id]' as any, params: { id: card.propertyId } });
                            } else if (card.ctaLink) {
                              Linking.openURL(card.ctaLink);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.profileCardCtaText}>{card.ctaText}</Text>
                          <ArrowRight size={16} color={Colors.white} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {!isAgency && agent && (
            <>
              {agent.specialties && agent.specialties.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    icon={Briefcase}
                    title="Specialties"
                    style={{ paddingHorizontal: 0, marginBottom: 14 }}
                  />
                  <View style={styles.tagsList}>
                    {agent.specialties.map((specialty, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.infoValue}>{agent.yearsExperience} years</Text>
                  <Text style={styles.infoLabel}>Experience</Text>
                </View>
                <View style={styles.infoCard}>
                  <Languages size={20} color={Colors.primary} />
                  <Text style={styles.infoValue}>{agent.languages.length}</Text>
                  <Text style={styles.infoLabel}>Languages</Text>
                </View>
              </View>

              {agent.languages && agent.languages.length > 0 && (
                <View style={styles.languagesList}>
                  {agent.languages.map((lang, index) => (
                    <Text key={index} style={styles.languageText}>
                      {lang}{index < agent.languages.length - 1 ? ' • ' : ''}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}

          {isAgency && agency && (
            <>
              {agency.specialties && agency.specialties.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    icon={Briefcase}
                    title="Specialties"
                    style={{ paddingHorizontal: 0, marginBottom: 14 }}
                  />
                  <View style={styles.tagsList}>
                    {agency.specialties.map((specialty, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {agency.founded && (
                <View style={styles.foundedSection}>
                  <Calendar size={18} color={Colors.primary} />
                  <Text style={styles.foundedText}>Founded in {agency.founded}</Text>
                </View>
              )}

              {agency.staff && agency.staff.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader
                    icon={Users}
                    title="Our Team"
                    style={{ paddingHorizontal: 0, marginBottom: 14 }}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffList}>
                    {agency.staff.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.staffCard}
                        onPress={() => router.push(`/profile/${member.id}?type=agent`)}
                      >
                        <Image source={{ uri: member.avatar }} style={styles.staffAvatar} />
                        <Text style={styles.staffName}>{member.name}</Text>
                        <Text style={styles.staffTitle}>{member.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}

          <View style={styles.contactSection}>
            <SectionHeader
              icon={Phone}
              title="Contact Information"
              style={{ paddingHorizontal: 0, marginBottom: 12 }}
            />
            <View style={styles.contactList}>
              {(isAgency ? agency?.email : agent?.email) && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`mailto:${isAgency ? agency?.email : agent?.email}`)}
                >
                  <Mail size={20} color={Colors.primary} />
                  <Text style={styles.contactText}>{isAgency ? agency?.email : agent?.email}</Text>
                </TouchableOpacity>
              )}
              {(isAgency ? agency?.phone : agent?.phone) && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`tel:${isAgency ? agency?.phone : agent?.phone}`)}
                >
                  <Phone size={20} color={Colors.primary} />
                  <Text style={styles.contactText}>{isAgency ? agency?.phone : agent?.phone}</Text>
                </TouchableOpacity>
              )}
              {isAgency && agency?.website && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`https://${agency.website}`)}
                >
                  <Globe size={20} color={Colors.primary} />
                  <Text style={styles.contactText}>{agency.website}</Text>
                </TouchableOpacity>
              )}
              {isAgency && agency?.address && (
                <View style={styles.contactItem}>
                  <MapPin size={20} color={Colors.primary} />
                  <Text style={styles.contactText}>{agency.address}</Text>
                </View>
              )}
            </View>
          </View>

          {(profile.socialMedia) && (
            <View style={styles.socialSection}>
              <SectionHeader
                icon={Share2}
                title="Social Media"
                style={{ paddingHorizontal: 0, marginBottom: 12 }}
              />
              <View style={styles.socialButtons}>
                {profile.socialMedia.linkedin && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(profile.socialMedia!.linkedin!)}
                  >
                    <Linkedin size={22} color={Colors.white} />
                  </TouchableOpacity>
                )}
                {profile.socialMedia.instagram && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(profile.socialMedia!.instagram!)}
                  >
                    <Instagram size={22} color={Colors.white} />
                  </TouchableOpacity>
                )}
                {profile.socialMedia.twitter && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(profile.socialMedia!.twitter!)}
                  >
                    <Twitter size={22} color={Colors.white} />
                  </TouchableOpacity>
                )}
                {isAgency && (profile.socialMedia as any).facebook && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL((profile.socialMedia as any).facebook)}
                  >
                    <Facebook size={22} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.propertiesSection}>
            <SectionHeader
              icon={Building2}
              title="Listed Properties"
              subtitle={`${properties.length} properties available`}
              style={{ paddingHorizontal: 0, marginBottom: 20 }}
            />
          </View>

          <View style={styles.propertiesGrid}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="grid"
                onPress={() => router.push(`/property/${property.id}`)}
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  bannerSection: {
    width: width,
    height: 240,
    position: 'relative' as const,
    backgroundColor: Colors.gray[200],
  },
  bannerImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  bannerOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  bannerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginTop: -60,
  },
  avatarContainer: {
    alignSelf: 'center' as const,
    position: 'relative' as const,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: Colors.white,
    backgroundColor: Colors.gray[100],
  },

  profileHeader: {
    alignItems: 'center' as const,
    marginBottom: 28,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
  },
  title: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  agencyLink: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 20,
    marginBottom: 16,
  },
  agencyLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center' as const,
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[300],
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    width: '100%' as const,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followingButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  followingButtonText: {
    color: Colors.primary,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  section: {
    marginBottom: 28,
  },
  bioSection: {
    marginBottom: 28,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  tagsList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  infoGrid: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 14,
    gap: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  languagesList: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    marginBottom: 28,
  },
  languageText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  foundedSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 28,
    justifyContent: 'center' as const,
  },
  foundedText: {
    fontSize: 15,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  staffList: {
    paddingRight: 20,
    gap: 12,
  },
  staffCard: {
    width: 120,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    backgroundColor: Colors.gray[100],
  },
  staffName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  staffTitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 14,
  },
  contactSection: {
    marginBottom: 28,
  },
  contactList: {
    gap: 12,
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    fontWeight: '500' as const,
  },
  socialSection: {
    marginBottom: 28,
  },
  socialButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 12,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  propertiesSection: {
    marginBottom: 0,
  },
  propertiesGrid: {
    gap: 20,
  },
  cardsSection: {
    marginBottom: 28,
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  profileCard: {
    width: width - 80,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  firstCard: {
    marginLeft: 0,
  },
  profileCardImage: {
    width: '100%' as const,
    height: 180,
  },
  profileCardContent: {
    padding: 16,
    gap: 8,
  },
  profileCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  profileCardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  profileCardCta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 255, 0.25)',
      },
    }),
  },
  profileCardCtaText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
