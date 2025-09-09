import DashboardNav from '@/components/DashboardNav';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SitesScreen() {
  const { userProfile } = useUser();
  const colorScheme = 'dark'; // Force dark mode
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

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

  // Create a stable callback using useMemo
  const handleTabChange = useMemo(() => {
    return (tab: 'sites' | 'complaints') => {
      console.log('🔥 handleTabChange called with:', tab);
      const newTabIndex = tab === 'sites' ? 0 : 1;
      setActiveTab(newTabIndex);
    };
  }, []);

  // Helper function to convert Firestore timestamps recursively
  const convertTimestamps = (obj: any): any => {
    if (!obj) return obj;

    if (obj.toDate && typeof obj.toDate === 'function') {
      // Convert Firestore timestamp to readable string
      return obj.toDate().toLocaleString();
    }

    if (Array.isArray(obj)) {
      // Handle arrays
      return obj.map(convertTimestamps);
    }

    if (typeof obj === 'object') {
      // Handle objects
      const converted: any = {};
      for (const key in obj) {
        converted[key] = convertTimestamps(obj[key]);
      }
      return converted;
    }

    // Return primitive values as-is
    return obj;
  };

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
        // Convert all timestamps recursively throughout the entire object
        const convertedData = convertTimestamps(data);

        complaintsData.push({
          id: doc.id,
          ...convertedData,
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
    router.push({
      pathname: '/complaint-detail',
      params: { complaint: JSON.stringify(complaint) }
    });
  }, [router]);

  // Group complaints by category
  const complaintCategories = useMemo(() => {
    const categories: ComplaintCategory[] = [
      { id: 'urgent', title: 'Urgent Issues', icon: 'warning', color: '#FF3B30', complaints: [] },
      { id: 'maintenance', title: 'Maintenance', icon: 'build', color: '#FF9500', complaints: [] },
      { id: 'resolved', title: 'Resolved', icon: 'checkmark-circle', color: '#34C759', complaints: [] },
      { id: 'scheduled', title: 'Scheduled', icon: 'calendar', color: '#007AFF', complaints: [] },
    ];

    complaints.forEach((complaint) => {
      const status = complaint.status?.toLowerCase();
      if (status === 'urgent' || status === 'critical' || complaint.urgency?.toLowerCase() === 'critical') {
        categories[0].complaints.push(complaint);
      } else if (status === 'pending' || status === 'in_progress') {
        categories[1].complaints.push(complaint);
      } else if (status === 'resolved' || status === 'completed') {
        categories[2].complaints.push(complaint);
      } else {
        categories[3].complaints.push(complaint);
      }
    });

    return categories;
  }, [complaints]);

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'resolved': return '#4CAF50'; // Green
      case 'accepted': return Colors[colorScheme ?? 'dark'].tint; // Golden (app's primary color)
      case 'pending': return '#757575'; // Gray
      case 'rejected': return '#F44336'; // Red (keeping for other statuses)
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency?.toLowerCase()) {
      case 'emergency':
      case 'critical': return '#F44336'; // Red
      case 'high': return '#FF9800'; // Yellow/Orange
      case 'normal':
      case 'medium':
      case 'low': return '#4CAF50'; // Green
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'emergency':
      case 'critical': return '#F44336'; // Red
      case 'high': return '#FF9800'; // Yellow/Orange
      case 'normal':
      case 'medium':
      case 'low': return '#4CAF50'; // Green
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

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
      backgroundColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
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
      color: Colors[colorScheme ?? 'dark'].text,
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
    complaintCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    complaintHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    complaintTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
      marginRight: 8,
    },
    complaintMeta: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 4,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    createdDate: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
    },
    complaintDescription: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].icon,
      lineHeight: 20,
      marginBottom: 12,
    },
    complaintFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerRight: {
      alignItems: 'flex-end',
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    footerText: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      marginLeft: 4,
    },
    urgencyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    urgencyText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 24,
    },
    categoryIcon: {
      marginRight: 8,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
    },
    categoryBadge: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    categoryBadgeText: {
      color: Colors[colorScheme ?? 'dark'].text,
      fontSize: 12,
      fontWeight: '600',
    },
    timeAgo: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
    },
  });

  if (complaintsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Sites & Complaints</Text>
          <Text style={styles.subtitle}>Manage Your Locations</Text>
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
        // Sites Tab
          <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sites management coming soon...</Text>
          </View>
        ) : (
        // Complaints Tab
        complaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints reported at the moment.</Text>
          </View>
        ) : (
          <FlatList
            data={complaintCategories}
            renderItem={({ item: category }) => (
              <View style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <MaterialIcons
                    name={category.icon as any}
                    size={20}
                    color={category.color}
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{category.complaints.length}</Text>
                  </View>
                </View>

                {category.complaints.map((complaint) => (
                  <TouchableOpacity
                    key={complaint.id}
                    style={styles.complaintCard}
                    onPress={() => handleComplaintPress(complaint)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.complaintHeader}>
                      <Text style={styles.complaintTitle}>
                        {complaint.title || complaint.issueType || 'Untitled Complaint'}
                      </Text>
                      <View style={styles.complaintMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                          <Text style={styles.statusText}>{complaint.status || 'Unknown'}</Text>
                        </View>
                        <Text style={styles.timeAgo}>
                          {typeof complaint.createdAt === 'string' ? complaint.createdAt : (complaint.createdAt?.toDate?.()?.toLocaleString() || complaint.timeAgo || 'Unknown time')}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.complaintDescription} numberOfLines={2}>
                      {complaint.description || 'No description available'}
                    </Text>

                    <View style={styles.complaintFooter}>
                      <View style={styles.footerLeft}>
                        <View style={styles.footerItem}>
                          <MaterialIcons name="business" size={14} color={Colors[colorScheme ?? 'dark'].icon} />
                          <Text style={styles.footerText}>
                            {complaint.location?.buildingName || complaint.site || 'Unknown location'}
                          </Text>
                        </View>
                        <View style={styles.footerItem}>
                          <Ionicons name="construct" size={14} color={Colors[colorScheme ?? 'dark'].icon} />
                          <Text style={styles.footerText}>
                            {complaint.lift?.liftId || complaint.liftId || 'Unknown lift'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.footerRight}>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(complaint.urgency || complaint.priority) }]}>
                          <Text style={styles.urgencyText}>{complaint.urgency || complaint.priority || 'Medium'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
          />
        )
      )}

      {/* Bottom Navigation */}
      <DashboardNav
        active={activeTab === 0 ? 'sites' : 'complaints'}
      />
    </View>
  );
}

interface Site {
  id: string;
  name?: string;
  address?: string;
  status?: string;
  totalLifts?: number;
}

interface ComplaintCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  complaints: any[];
}

interface Complaint {
  id: string;
  title?: string;
  issueType?: string;
  description?: string;
  status?: string;
  priority?: string;
  urgency?: string;
  location?: any;
  lift?: any;
  customer?: any;
  createdAt?: string;
  updatedAt?: string;
  assignedAt?: string;
  acceptedAt?: string;
  messages?: any[];
  photos?: string[];
  videos?: string[];
  voiceMessage?: string;
  timeAgo?: string;
}
