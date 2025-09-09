import DashboardNav from '@/components/DashboardNav';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'accepted' | 'completed';

export default function ComplaintsScreen() {
  const { userProfile } = useUser();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('accepted');

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
      setLoading(true);

      if (!userProfile?.email) {
        console.log('No user email found');
        setAllComplaints([]);
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

      setAllComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setAllComplaints([]);
    } finally {
      setLoading(false);
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


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    filterChip: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      marginHorizontal: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: colorScheme === 'dark' ? 0.1 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    filterChipActive: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderColor: Colors[colorScheme ?? 'dark'].tint,
    },
    filterChipText: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
    },
    filterChipTextActive: {
      color: '#FFFFFF',
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
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: colorScheme === 'dark' ? 0.15 : 0.08,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
    },
    complaintHeader: {
      marginBottom: 12,
    },
    complaintTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 8,
      lineHeight: 24,
    },
    statusIconCorner: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
    complaintDescription: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
      lineHeight: 24,
      marginBottom: 16,
    },
    complaintFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme ?? 'dark'].border,
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 12,
    },
    footerText: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].icon,
      marginLeft: 6,
      fontWeight: '500',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'dark'].border,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
    },
    closeButton: {
      padding: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
      textAlign: 'center',
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
      borderColor: Colors[colorScheme ?? 'dark'].border,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
    },
    detailRow: {
      marginBottom: 12,
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].icon,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
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
      color: Colors[colorScheme ?? 'dark'].tint,
    },
    messageTime: {
      fontSize: 11,
      color: Colors[colorScheme ?? 'dark'].icon,
    },
    messageText: {
      fontSize: 13,
      lineHeight: 18,
      color: Colors[colorScheme ?? 'dark'].text,
    },
    attachmentSection: {
      marginBottom: 12,
    },
    attachmentTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].icon,
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
      color: Colors[colorScheme ?? 'dark'].tint,
      marginBottom: 4,
      textDecorationLine: 'underline',
    },
  });

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

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'resolved': return 'checkmark-circle';
      case 'accepted': return 'add-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Get complaint counts by status
  const getComplaintCount = (status: FilterType) => {
    if (status === 'all') return allComplaints.length;
    return allComplaints.filter(complaint => complaint.status?.toLowerCase() === status).length;
  };

  // Get filtered complaints based on active filter
  const complaints = allComplaints.filter(complaint => {
    if (activeFilter === 'all') return true;
    return complaint.status?.toLowerCase() === activeFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: 96 }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header - Same as Sites */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Complaints</Text>
          <Text style={styles.subtitle}>Manage Service Requests</Text>
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

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'accepted' && styles.filterChipActive]}
          onPress={() => setActiveFilter('accepted')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, activeFilter === 'accepted' && styles.filterChipTextActive]}>
            Accepted ({getComplaintCount('accepted')})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'completed' && styles.filterChipActive]}
          onPress={() => setActiveFilter('completed')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, activeFilter === 'completed' && styles.filterChipTextActive]}>
            Completed ({getComplaintCount('completed')})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {activeFilter} complaints at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.complaintCard}
              onPress={() => handleComplaintPress(item)}
              activeOpacity={0.7}
            >
              {/* Status Icon in Top-Right Corner */}
              <View style={[styles.statusIconCorner, { backgroundColor: getStatusColor(item.status) }]}>
                <Ionicons
                  name={getStatusIcon(item.status)}
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.complaintHeader}>
                <Text style={styles.complaintTitle}>
                  {item.title || item.issueType || 'Untitled Complaint'}
                </Text>
              </View>

              <Text style={styles.complaintDescription} numberOfLines={2}>
                {item.description || 'No description available'}
              </Text>

              <View style={styles.complaintFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="person" size={16} color={Colors[colorScheme ?? 'dark'].icon} />
                  <Text style={styles.footerText}>
                    {item.customer?.fullName || 'Unknown customer'}
                  </Text>
                </View>
                <View style={styles.footerItem}>
                  <Ionicons name="construct" size={16} color={Colors[colorScheme ?? 'dark'].icon} />
                  <Text style={styles.footerText}>
                    {item.lift?.liftId || item.liftId || 'Unknown lift'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      {/* Bottom Navigation */}
      <DashboardNav active="complaints" />

    </View>
  );

}
