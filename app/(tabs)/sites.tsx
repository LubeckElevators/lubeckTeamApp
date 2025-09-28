import DashboardNav from '@/components/DashboardNav';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Site interface based on Firebase data structure
interface AttendanceRecord {
  date: string;
  memberId: string;
  memberName: string;
  siteId: string;
  status: 'Present' | 'Absent' | 'Unmarked';
}

interface CivilWork {
  dualLoadHook: boolean;
  entranceBeam: boolean;
  frontWallElevation: boolean;
  mrlWindow: boolean;
  pitWaterProofing: boolean;
  rccEntrance: boolean;
  shaftPlaster: boolean;
  status: string;
  terraceStair: boolean;
  whiteWash: boolean;
}

interface ElectricalWork {
  earthingWire: boolean;
  mcbBox: boolean;
  status: string;
  threePhaseConnection: boolean;
}

interface InstallationTasks {
  [key: string]: string;
}

interface StairsWork {
  status: string;
}

interface LiftSquareFolding {
  status: string;
}

interface Site {
  id: string;
  siteId: string;
  siteName: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerUserId: string;
  liftId: string;
  liftName: string;
  liftType: string;
  siteType: string;
  siteAddress: string;
  city: string;
  state: string;
  pincode: string;
  floorsCount: number;
  openingsCount: number;
  flat: string;
  googleLocation: string;
  hasWarranty: string;
  warrantyExpiryDate: string;
  licence: string;
  assignedDate: string;
  operationsStartDate: string;
  operationsEndDate: string;
  currentStep: number;
  completedSteps: number[];
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
  syncedBy: string;
  isDraft: boolean;
  assignedTeamMembers: string[];
  attendanceRecords: AttendanceRecord[];
  additionalDocumentsUrls: string[];
  siteStatus?: string;
  amcProvider: string;
  amcStartDate: string;
  amcExpiryDate: string;
  amcType: string;
  buildingElevationUrl: string | null;
  cabinModel: string;
  civilWork: CivilWork;
  copRfid: string;
  copType: string;
  doorFrameType: string;
  electricalWork: ElectricalWork;
  installationTasks: InstallationTasks;
  liftDrawingUrl: string;
  liftSquareFolding: LiftSquareFolding;
  lopRfid: string;
  lopType: string;
  materialsList: any[];
  ownerAadharUrl: string;
  ownerPanUrl: string | null;
  ownerPhotoUrl: string | null;
  shaftSize: string;
  siteMapUrl: string | null;
  stairsWork: StairsWork;
}

export default function SitesScreen() {
  const { userProfile } = useUser();
  const colorScheme = 'dark'; // Force dark mode
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [sitesTab, setSitesTab] = useState<'active' | 'completed'>('active');
  const [imageError, setImageError] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

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

  // Filter sites based on selected tab
  const filteredSites = useMemo(() => {
    const activeSites = sites.filter(site => site.siteStatus !== 'Completed');
    const completedSites = sites.filter(site => site.siteStatus === 'Completed');

    // Debug logging to verify siteStatus classification
    if (sites.length > 0) {
      console.log('Site Status Classification:', {
        total: sites.length,
        active: activeSites.length,
        completed: completedSites.length,
        activeSiteStatuses: activeSites.map(site => ({ id: site.id, status: site.siteStatus })),
        completedSiteStatuses: completedSites.map(site => ({ id: site.id, status: site.siteStatus }))
      });
    }

    if (sitesTab === 'active') {
      return activeSites;
    } else if (sitesTab === 'completed') {
      return completedSites;
    }
    return sites;
  }, [sites, sitesTab]);

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

  // Fetch sites from Firestore
  const fetchSites = useCallback(async () => {
    try {
      setSitesLoading(true);

      if (!userProfile?.email) {
        console.log('No user email found');
        setSites([]);
        return;
      }

      // Get sites from /team/{TeamMemberID}/sites/{SiteOwnerEmail}
      const sitesRef = collection(db, 'team', userProfile.email, 'sites');
      const sitesSnapshot = await getDocs(sitesRef);

      const sitesData: Site[] = [];
      sitesSnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert all timestamps recursively throughout the entire object
        const convertedData = convertTimestamps(data);

        sitesData.push({
          id: doc.id,
          ...convertedData,
        } as Site);
      });

      // Sort by created date (newest first)
      sitesData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    } finally {
      setSitesLoading(false);
    }
  }, [userProfile?.email]);

  // Fetch sites on component mount and when user profile changes
  useEffect(() => {
    if (userProfile?.email) {
      fetchSites();
    }
  }, [userProfile?.email, fetchSites]);

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

  // Calculate progress based on start date, end date, and current date
  const calculateProgress = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date();

      // If current date is before start date, progress is 0
      if (current < start) return 0;

      // If current date is after end date, progress is 100
      if (current > end) return 100;

      // Calculate progress percentage
      const totalDuration = end.getTime() - start.getTime();
      const elapsedTime = current.getTime() - start.getTime();

      if (totalDuration <= 0) return 0;

      const progress = (elapsedTime / totalDuration) * 100;
      return Math.max(0, Math.min(100, Math.round(progress)));
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
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

    // Sites Styles
    sitesList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    siteCard: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    liftInfo: {
      flex: 1,
      marginRight: 8,
    },
    liftName: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 2,
      letterSpacing: 0.3,
    },
    liftId: {
      fontSize: 11,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].tint,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      minWidth: 70,
    },
    statusBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    locationText: {
      fontSize: 13,
      color: Colors[colorScheme ?? 'dark'].text,
      marginLeft: 6,
      flex: 1,
    },
    ownerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: 'rgba(76, 175, 80, 0.05)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    ownerName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      marginLeft: 8,
    },
    callButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      marginLeft: 6,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    locationButton: {
      backgroundColor: '#4CAF50', // Green
    },
    detailsButton: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint, // App theme color
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    progressContainer: {
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
    },
    progressPercent: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors[colorScheme ?? 'dark'].tint,
    },
    progressBar: {
      height: 5,
      backgroundColor: Colors[colorScheme ?? 'dark'].border,
      borderRadius: 2.5,
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 2.5,
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 1,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
    },

    // Sites Tab Styles
    sitesTabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'dark'].border,
    },
    sitesTab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
      backgroundColor: Colors[colorScheme ?? 'dark'].border,
    },
    sitesTabActive: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
    },
    sitesTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].icon,
    },
    sitesTabTextActive: {
      color: '#000000',
    },
    sitesTabBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: Colors[colorScheme ?? 'dark'].card,
    },
    sitesTabBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
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
          <Text style={styles.title}>Sites</Text>
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

      {/* Sites Tabs */}
      {activeTab === 0 && (
        <View style={styles.sitesTabContainer}>
          <TouchableOpacity
            style={[styles.sitesTab, sitesTab === 'active' && styles.sitesTabActive]}
            onPress={() => setSitesTab('active')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sitesTabText, sitesTab === 'active' && styles.sitesTabTextActive]}>
              Active Sites
            </Text>
            {sites.filter(site => site.siteStatus !== 'Completed').length > 0 && (
              <View style={styles.sitesTabBadge}>
                <Text style={styles.sitesTabBadgeText}>
                  {sites.filter(site => site.siteStatus !== 'Completed').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sitesTab, sitesTab === 'completed' && styles.sitesTabActive]}
            onPress={() => setSitesTab('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sitesTabText, sitesTab === 'completed' && styles.sitesTabTextActive]}>
              Completed
            </Text>
            {sites.filter(site => site.siteStatus === 'Completed').length > 0 && (
              <View style={styles.sitesTabBadge}>
                <Text style={styles.sitesTabBadgeText}>
                  {sites.filter(site => site.siteStatus === 'Completed').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {activeTab === 0 ? (
        // Sites Tab
        sitesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
            <Text style={styles.loadingText}>Loading sites...</Text>
          </View>
        ) : filteredSites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {sitesTab === 'active'
                ? 'No active sites at the moment.'
                : 'No completed sites yet.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSites}
            keyExtractor={(item) => item.id}
            renderItem={({ item: site }) => (
              <View style={styles.siteCard}>
                {/* Top Section - Lift Info & Status */}
                <View style={styles.cardTop}>
                  <View style={styles.liftInfo}>
                    <Text style={styles.liftName} numberOfLines={1}>
                      {site.liftName || site.siteName}
        </Text>
                    <Text style={styles.liftId}>{site.liftId}</Text>
      </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: site.siteStatus === 'Completed' ? '#4CAF50' : Colors[colorScheme ?? 'dark'].tint
                  }]}>
                    <Text style={styles.statusBadgeText}>
                      {site.siteStatus || 'In Progress'}
                    </Text>
      </View>
          </View>

                {/* Location */}
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={Colors[colorScheme ?? 'dark'].icon} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {site.flat}, {site.siteAddress}
                    {site.city && site.state && site.pincode
                      ? `\n${site.city}, ${site.state} - ${site.pincode}`
                      : ''}
            </Text>
          </View>

                {/* Owner Contact */}
                <View style={styles.ownerRow}>
                  <Ionicons name="person-circle" size={16} color={Colors[colorScheme ?? 'dark'].icon} />
                  <Text style={styles.ownerName}>{site.ownerName}</Text>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => Linking.openURL(`tel:${site.ownerPhone}`)}
                  >
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
        </View>

                {/* Progress Bar */}
                {site.operationsStartDate && site.operationsEndDate && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercent}>
                        {calculateProgress(site.operationsStartDate, site.operationsEndDate)}%
                      </Text>
                    </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                          { width: `${calculateProgress(site.operationsStartDate, site.operationsEndDate)}%` }
                      ]}
                    />
                  </View>
            </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.locationButton]}
                    onPress={() => {
                      if (site.googleLocation) {
                        Linking.openURL(site.googleLocation);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="map" size={14} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>View Location</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.detailsButton]}
                    onPress={() => router.push({
                      pathname: '/site-detail',
                      params: { site: JSON.stringify(site) }
                    })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="information-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>
            </View>
            </View>
            )}
            contentContainerStyle={styles.sitesList}
            showsVerticalScrollIndicator={false}
          />
        )
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
