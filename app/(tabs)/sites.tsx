import BottomNav from '@/components/BottomNav';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UnifiedScreen() {
  const { userProfile } = useUser();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);

  // User profile data
  const profileData = {
    aadhar: "5788 6888 9201",
    email: "raghav.sachdeveloper@gmail.com",
    name: "Raghav Sachdev",
    phone: "8178648498",
    profilepic: "https://media.licdn.com/dms/image/v2/D4D03AQEi1foHXK-r_w/profile-displayphoto-shrink_400_400/B4DZbzs07LGYAk-/0/1747845337681?e=1759363200&v=beta&t=kyEJJZPUJR6XlMw4mPpJa-q6zkI7tM0RW_QdmKKCORI",
    role: "electrical_contractor"
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Mock sites data (design only)
  const sites = useMemo(() => ([
    {
      id: 'SITE-001',
      name: 'Downtown Plaza',
      address: '123 Main St, Downtown',
      liftsCount: 8,
      status: 'Active',
      lastInspection: '2024-01-15'
    },
    {
      id: 'SITE-002',
      name: 'Riverside Towers',
      address: '456 River Rd, Riverside',
      liftsCount: 12,
      status: 'Active',
      lastInspection: '2024-01-10'
    },
    {
      id: 'SITE-003',
      name: 'Central Mall',
      address: '789 Commerce Ave, Central',
      liftsCount: 6,
      status: 'Maintenance',
      lastInspection: '2024-01-08'
    },
    {
      id: 'SITE-004',
      name: 'Harbor View',
      address: '321 Harbor Dr, Waterfront',
      liftsCount: 4,
      status: 'Active',
      lastInspection: '2024-01-12'
    },
  ]), []);

  // Group complaints by status for display
  const complaintCategories = useMemo(() => {
    const grouped = {
      urgent: { id: 'urgent', title: 'Urgent Issues', icon: 'warning', color: '#FF3B30', complaints: [] as any[] },
      maintenance: { id: 'maintenance', title: 'Maintenance', icon: 'build', color: '#FF9500', complaints: [] as any[] },
      resolved: { id: 'resolved', title: 'Resolved', icon: 'checkmark-circle', color: '#34C759', complaints: [] as any[] },
      scheduled: { id: 'scheduled', title: 'Scheduled', icon: 'calendar', color: '#007AFF', complaints: [] as any[] },
    };

    // Group complaints by urgency/status
    complaints.forEach(complaint => {
      const urgency = complaint.urgency?.toLowerCase() || 'medium';
      const status = complaint.status?.toLowerCase() || 'open';

      if (urgency === 'critical' || urgency === 'high') {
        grouped.urgent.complaints.push(complaint);
      } else if (status === 'resolved' || status === 'closed') {
        grouped.resolved.complaints.push(complaint);
      } else if (status === 'scheduled') {
        grouped.scheduled.complaints.push(complaint);
      } else {
        grouped.maintenance.complaints.push(complaint);
      }
    });

    return Object.values(grouped);
  }, [complaints]);

  const handleTabChange = useCallback((tab: 'sites' | 'complaints') => {
    setActiveTab(tab === 'sites' ? 0 : 1);
  }, []);

  // Fetch complaints from Firestore
  const fetchComplaints = useCallback(async () => {
    try {
      setComplaintsLoading(true);

      if (!userProfile?.email) {
        console.log('No user email found');
        setComplaints([]);
        return;
      }

      // Get complaints from /team/{TeamMemberID}/complaints/
      const complaintsRef = collection(db, 'team', userProfile.email, 'complaints');
      const complaintsSnapshot = await getDocs(complaintsRef);

      const complaintsData: any[] = [];
      complaintsSnapshot.forEach((doc) => {
        const data = doc.data();
        complaintsData.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to readable format
          createdAt: data.createdAt?.toDate?.()?.toLocaleString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toLocaleString() || data.updatedAt,
          assignedAt: data.assignedAt?.toDate?.()?.toLocaleString() || data.assignedAt,
          acceptedAt: data.acceptedAt?.toDate?.()?.toLocaleString() || data.acceptedAt,
        });
      });

      // Sort by created date (newest first)
      complaintsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }, [userProfile?.email]);

  // Fetch complaints on component mount and when user profile changes
  useEffect(() => {
    if (userProfile?.email) {
      fetchComplaints();
    }
  }, [userProfile?.email, fetchComplaints]);

  // Handle complaint card press
  const handleComplaintPress = useCallback((complaint: any) => {
    setSelectedComplaint(complaint);
    setComplaintModalVisible(true);
  }, []);

  // Close complaint modal
  const closeComplaintModal = useCallback(() => {
    setComplaintModalVisible(false);
    setSelectedComplaint(null);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '400',
    },
    profileIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors[colorScheme ?? 'dark'].background,
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 28,
    },
    profileIconText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
      lineHeight: 24,
    },
    listContentContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            {activeTab === 0 ? 'Sites' : 'Complaints'}
          </Text>
          <Text style={styles.subtitle}>
            {activeTab === 0 ? 'Manage Your Locations' : 'Track & Manage Issues'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileIcon}>
            {profileData.profilepic && !imageError ? (
              <Image
                source={{ uri: profileData.profilepic }}
                style={styles.profileImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.profileIconText}>
                {getInitials(profileData.name)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>


      {/* Content */}
      {activeTab === 0 ? (
        // Sites Content
        sites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sites data is available at the moment.</Text>
          </View>
        ) : (
          <FlatList
            data={sites}
            renderItem={({ item }) => <SiteCard site={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )
      ) : (
        // Complaints Content
        complaintCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints reported at the moment.</Text>
          </View>
        ) : (
          <FlatList
            data={complaintCategories}
            renderItem={({ item }) => (
              <ComplaintCategoryCard
                category={item}
                onComplaintPress={handleComplaintPress}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )
      )}

      {/* Bottom Navigation */}
      <BottomNav
        active={activeTab === 0 ? 'sites' : 'complaints'}
        onTabChange={handleTabChange}
      />

      {/* Complaint Detail Modal */}
      <Modal
        visible={complaintModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeComplaintModal}
      >
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={closeComplaintModal}
        />
      </Modal>
    </View>
  );
}

interface Site {
  id: string;
  name: string;
  address: string;
  liftsCount: number;
  status: string;
  lastInspection: string;
}

interface ComplaintCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  complaints: Complaint[];
}

interface Complaint {
  id: string;
  title?: string;
  site?: string;
  liftId?: string;
  priority?: string;
  status?: string;
  reportedDate?: string;
  description?: string;
  timeAgo?: string;
  // Firestore fields
  complaintId?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  assignedAt?: string;
  assignedBy?: string;
  urgency?: string;
  issueType?: string;
  customer?: any;
  lift?: any;
  location?: any;
  messages?: any[];
  attachments?: any;
  photos?: string[];
  videos?: string[];
  voiceMessage?: string;
  teamMember?: any;
  fullName?: string;
  email?: string;
  phone?: string;
}

function SiteCard({ site }: { site: Site }) {
  const colorScheme = useColorScheme();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return '#4CAF50';
      case 'Maintenance': return '#FF9800';
      case 'Inactive': return '#F44336';
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  return (
    <View style={[styles.siteCard, {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderColor: Colors[colorScheme ?? 'dark'].border
    }]}>
      <View style={styles.siteHeader}>
        <Text style={[styles.siteName, { color: Colors[colorScheme ?? 'dark'].text }]}>
          {site.name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
          <Text style={styles.statusText}>{site.status}</Text>
        </View>
      </View>

      <Text style={[styles.siteAddress, { color: Colors[colorScheme ?? 'dark'].icon }]}>
        {site.address}
      </Text>

      <View style={styles.siteDetails}>
        <Text style={[styles.detailText, { color: Colors[colorScheme ?? 'dark'].icon }]}>
          Lifts: {site.liftsCount}
        </Text>
        <Text style={[styles.detailText, { color: Colors[colorScheme ?? 'dark'].icon }]}>
          Last Inspection: {site.lastInspection}
        </Text>
      </View>
    </View>
  );
}

function ComplaintCategoryCard({ category, onComplaintPress }: { category: ComplaintCategory; onComplaintPress: (complaint: any) => void }) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.categoryCard, {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderColor: Colors[colorScheme ?? 'dark'].border
    }]}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Ionicons
            name={category.icon as any}
            size={24}
            color={category.color}
            style={styles.categoryIcon}
          />
          <Text style={[styles.categoryTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
            {category.title}
          </Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
          <Text style={styles.categoryBadgeText}>{category.complaints.length}</Text>
        </View>
      </View>

      {category.complaints.map((complaint) => (
        <ComplaintItem
          key={complaint.id}
          complaint={complaint}
          onPress={() => onComplaintPress(complaint)}
        />
      ))}
    </View>
  );
}

function ComplaintItem({ complaint, onPress }: { complaint: Complaint; onPress: () => void }) {
  const colorScheme = useColorScheme();

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return '#F44336';
      case 'High': return '#FF5722';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  return (
    <TouchableOpacity style={styles.complaintItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.complaintHeader}>
        <Text style={[styles.complaintTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
          {complaint.title || complaint.issueType || 'Untitled Complaint'}
        </Text>
        <Text style={[styles.timeAgo, { color: Colors[colorScheme ?? 'dark'].icon }]}>
          {complaint.createdAt || complaint.timeAgo || 'Unknown time'}
        </Text>
      </View>

      <Text style={[styles.complaintDescription, { color: Colors[colorScheme ?? 'dark'].icon }]}>
        {complaint.description}
      </Text>

      <View style={styles.complaintDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="business" size={14} color={Colors[colorScheme ?? 'dark'].icon} />
          <Text style={[styles.detailText, { color: Colors[colorScheme ?? 'dark'].icon }]}>
            {complaint.location?.buildingName || complaint.site || 'Unknown location'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="construct" size={14} color={Colors[colorScheme ?? 'dark'].icon} />
          <Text style={[styles.detailText, { color: Colors[colorScheme ?? 'dark'].icon }]}>
            {complaint.lift?.liftId || complaint.liftId || 'Unknown lift'}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(complaint.urgency || complaint.priority) }]}>
          <Text style={styles.priorityText}>{complaint.urgency || complaint.priority || 'Medium'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ComplaintDetailModal({ complaint, onClose }: { complaint: any; onClose: () => void }) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  if (!complaint) return null;

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return '#F44336';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  return (
    <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
      <View style={[styles.modalHeader, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'dark'].text} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
          Complaint Details
        </Text>
        <View style={styles.headerBadge}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(complaint.urgency || complaint.priority) }]}>
            <Text style={styles.priorityText}>{complaint.urgency || complaint.priority || 'Medium'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Basic Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Title:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
              {complaint.title || complaint.issueType || 'Untitled Complaint'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Description:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
              {complaint.description || 'No description available'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Status:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
              {complaint.status || 'Unknown'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Created:</Text>
            <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
              {complaint.createdAt || 'Unknown'}
            </Text>
          </View>

          {complaint.updatedAt && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Updated:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.updatedAt}
              </Text>
            </View>
          )}
        </View>

        {/* Customer Information */}
        {complaint.customer && (
          <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Customer Information
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Name:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.customer.fullName || complaint.fullName || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Email:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.customer.email || complaint.email || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Phone:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.customer.phone || complaint.phone || 'Unknown'}
              </Text>
            </View>

            {complaint.customer.address && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Address:</Text>
                <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                  {complaint.customer.address.flatNumber || ''} {complaint.customer.address.addressLine1 || ''}, {complaint.customer.address.city || ''}, {complaint.customer.address.state || ''} {complaint.customer.address.pincode || ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Lift Information */}
        {complaint.lift && (
          <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Lift Information
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Lift ID:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.lift.liftId || complaint.liftId || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Lift Name:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.lift.liftName || 'Unknown'}
              </Text>
            </View>

            {complaint.lift.liftImage && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Lift Image:</Text>
                <Image
                  source={{ uri: complaint.lift.liftImage }}
                  style={styles.liftImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {complaint.lift.amcDetails && (
              <>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>AMC Type:</Text>
                  <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                    {complaint.lift.amcDetails.amcType || 'Unknown'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>AMC Provider:</Text>
                  <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                    {complaint.lift.amcDetails.provider || 'Unknown'}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Location Information */}
        {complaint.location && (
          <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Location Information
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Building:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.location.buildingName || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Address:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.location.address || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[colorScheme ?? 'dark'].icon }]}>Floor Range:</Text>
              <Text style={[styles.detailValue, { color: Colors[colorScheme ?? 'dark'].text }]}>
                {complaint.location.floorRange || 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {/* Messages */}
        {complaint.messages && complaint.messages.length > 0 && (
          <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Messages ({complaint.messages.length})
            </Text>

            {complaint.messages.map((message: any, index: number) => (
              <View key={message.id || index} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Text style={[styles.messageSender, { color: Colors[colorScheme ?? 'dark'].tint }]}>
                    {message.sender || 'Unknown'}
                  </Text>
                  <Text style={[styles.messageTime, { color: Colors[colorScheme ?? 'dark'].icon }]}>
                    {message.timestamp || 'Unknown time'}
                  </Text>
                </View>
                <Text style={[styles.messageText, { color: Colors[colorScheme ?? 'dark'].text }]}>
                  {message.message || 'No message content'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Attachments */}
        {(complaint.photos || complaint.videos || complaint.voiceMessage) && (
          <View style={[styles.detailSection, { backgroundColor: Colors[colorScheme ?? 'dark'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Attachments
            </Text>

            {complaint.photos && complaint.photos.length > 0 && (
              <View style={styles.attachmentSection}>
                <Text style={[styles.attachmentTitle, { color: Colors[colorScheme ?? 'dark'].icon }]}>
                  Photos ({complaint.photos.length}):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {complaint.photos.map((photo: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {complaint.videos && complaint.videos.length > 0 && (
              <View style={styles.attachmentSection}>
                <Text style={[styles.attachmentTitle, { color: Colors[colorScheme ?? 'dark'].icon }]}>
                  Videos ({complaint.videos.length}):
                </Text>
                {complaint.videos.map((video: string, index: number) => (
                  <Text key={index} style={[styles.videoLink, { color: Colors[colorScheme ?? 'dark'].tint }]}>
                    Video {index + 1}: {video.substring(0, 50)}...
                  </Text>
                ))}
              </View>
            )}

            {complaint.voiceMessage && (
              <View style={styles.attachmentSection}>
                <Text style={[styles.attachmentTitle, { color: Colors[colorScheme ?? 'dark'].icon }]}>
                  Voice Message:
                </Text>
                <Text style={[styles.videoLink, { color: Colors[colorScheme ?? 'dark'].tint }]}>
                  {complaint.voiceMessage.substring(0, 50)}...
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerBadge: {
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  liftImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginTop: 4,
  },
  messageItem: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 11,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentSection: {
    marginBottom: 12,
  },
  attachmentTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  photoScroll: {
    marginTop: 8,
  },
  attachmentImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  videoLink: {
    fontSize: 12,
    marginBottom: 4,
    textDecorationLine: 'underline',
  },

  // Existing styles
  siteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  siteAddress: {
    fontSize: 14,
    marginBottom: 8,
  },
  siteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  complaintItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  complaintTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  timeAgo: {
    fontSize: 11,
    fontWeight: '500',
  },
  complaintDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  complaintDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
