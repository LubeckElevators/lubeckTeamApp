import InstallationPlan from '@/components/InstallationPlan';
import OrderDetails from '@/components/OrderDetails';
import OwnerDetails from '@/components/OwnerDetails';
import PreworkingStage from '@/components/PreworkingStage';
import SiteDetails from '@/components/SiteDetails';
import TechnicalDetails from '@/components/TechnicalDetails';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React from 'react';
import { Alert, Dimensions, Linking, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Attendance Calendar Component
const AttendanceCalendar: React.FC<{
  attendanceRecords: AttendanceRecord[];
  operationsStartDate: string;
  operationsEndDate: string;
}> = ({ attendanceRecords, operationsStartDate, operationsEndDate }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [attendanceMap, setAttendanceMap] = React.useState<Map<string, AttendanceRecord>>(new Map());

  // Create attendance lookup map for quick access
  React.useEffect(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach(record => {
      map.set(record.date, record);
    });
    setAttendanceMap(map);
  }, [attendanceRecords]);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);

    // Generate 5 weeks (35 days) to fill the calendar grid
    for (let i = 0; i < 36; i++) {
      // Create date string in local timezone to avoid off-by-one errors
      const dateString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

      const dayData = {
        date: new Date(current),
        dateString: dateString,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        attendance: attendanceMap.get(dateString)
      };
      days.push(dayData);
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Check if date is within operations period
  const isWithinOperationsPeriod = (dateString: string) => {
    if (!operationsStartDate || !operationsEndDate) return false;
    const date = new Date(dateString);
    const start = new Date(operationsStartDate);
    const end = new Date(operationsEndDate);
    return date >= start && date <= end;
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Header with navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.weekdaysContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const isWithinOps = day.isCurrentMonth && isWithinOperationsPeriod(day.dateString);

          // Determine cell background based on attendance status first
          let cellBackground = {};
          if (day.attendance?.status === 'Present') {
            cellBackground = styles.attendancePresentCell;
          } else if (day.attendance?.status === 'Absent') {
            cellBackground = styles.attendanceAbsentCell;
          } else if (day.attendance?.status === 'Unmarked') {
            // Apply faded green for Unmarked (operational) dates
            cellBackground = styles.operationDayCell;
          } else if (day.isCurrentMonth) {
            cellBackground = styles.currentMonthCell;
          } else {
            cellBackground = styles.otherMonthCell;
          }

          const cellStyle = {
            ...styles.calendarCell,
            ...cellBackground,
            ...(day.isToday ? styles.todayCell : {}),
          };

            return (
            <View key={index} style={cellStyle}>
              <Text style={[
                styles.dayNumber,
                (day.attendance?.status === 'Present' || day.attendance?.status === 'Absent') ?
                styles.coloredCellText : {}
              ]}>
                {day.date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.attendancePresentCell]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.attendanceAbsentCell]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DEB54B' }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};

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

export default function SiteDetailScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useUser();
  const { site: siteParam } = useLocalSearchParams();
  const [site, setSite] = React.useState<Site | null>(null);
  const [attendanceModalVisible, setAttendanceModalVisible] = React.useState(false);
  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [lastMarkedStatus, setLastMarkedStatus] = React.useState<'Present' | 'Absent' | null>(null);
  const [completeSiteModalVisible, setCompleteSiteModalVisible] = React.useState(false);
  const [userPassword, setUserPassword] = React.useState('');
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);
  const [siteStatus, setSiteStatus] = React.useState<string | null>(null);

  // Callback to handle materials list updates for immediate UI feedback
  const handleMaterialsUpdate = (updatedMaterials: any[]) => {
    if (site) {
      setSite({
        ...site,
        materialsList: updatedMaterials
      });
    }
  };

  // Callback to handle quality check updates for immediate UI feedback
  const handleQualityCheckUpdate = (updatedInstallationTasks: { [key: string]: string }) => {
    if (site) {
      setSite({
        ...site,
        installationTasks: updatedInstallationTasks
      });
    }
  };

  React.useEffect(() => {
    if (siteParam) {
      try {
        const parsedSite = JSON.parse(siteParam as string);
        setSite(parsedSite);
      } catch (error) {
        console.error('Error parsing site data:', error);
        router.back();
      }
    }
  }, [siteParam, router]);

  // Refresh site data when component mounts
  React.useEffect(() => {
    if (site && userProfile?.email) {
      const refreshSiteData = async () => {
        try {
          // console.log('Refreshing site data from Firebase...');
          const siteDocRef = doc(db, 'team', userProfile.email, 'sites', site.siteId || site.id);
          const siteDoc = await getDoc(siteDocRef);

          if (siteDoc.exists()) {
            const freshData = siteDoc.data();
            // console.log('Fresh Firebase data:', freshData);
            // console.log('Attendance records:', freshData.attendanceRecords);

            // Update site with fresh data
            const updatedSite = {
              ...site,
              ...freshData,
              attendanceRecords: freshData.attendanceRecords || []
            };
            setSite(updatedSite);
            setSiteStatus(freshData.siteStatus || null);
            // console.log('Site updated with fresh data');
          } else {
            console.log('Site document not found in Firebase');
          }
        } catch (error) {
          console.error('Error refreshing site data:', error);
        }
      };

      refreshSiteData();
    }
  }, [site?.id, userProfile?.email]);

  // Validate site status from Firebase when component mounts
  React.useEffect(() => {
    if (site && userProfile?.email) {
      const validateSiteStatus = async () => {
        try {
          const ownerEmail = (site as any).ownerEmail;
          if (!ownerEmail) return;

          // Check both Firebase paths for site status
          const teamSiteDocRef = doc(db, 'team', userProfile.email, 'sites', ownerEmail);
          const ownerSiteDocRef = doc(db, 'sites', ownerEmail);

          const [teamSiteDoc, ownerSiteDoc] = await Promise.all([
            getDoc(teamSiteDocRef),
            getDoc(ownerSiteDocRef)
          ]);

          let status = null;
          
          // Priority: Check team path first, then owner path
          if (teamSiteDoc.exists()) {
            status = teamSiteDoc.data()?.siteStatus;
          } else if (ownerSiteDoc.exists()) {
            status = ownerSiteDoc.data()?.siteStatus;
          }

          setSiteStatus(status || null);
          console.log('Site status validated from Firebase:', status);
        } catch (error) {
          console.error('Error validating site status:', error);
        }
      };

      validateSiteStatus();
    }
  }, [site?.id, userProfile?.email]);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('complete')) return '#4CAF50';
    if (statusLower?.includes('incomplete')) return '#FF9800';
    return '#757575';
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#4CAF50';
      case 'Absent': return '#F44336';
      case 'Unmarked': return '#FF9800';
      default: return '#757575';
    }
  };


  const openLocation = (url: string) => {
    Linking.openURL(url);
  };

  // Get current date in YYYY/MM/DD format
  const getCurrentDateFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Get next lift index by checking existing lifts
  const getNextLiftIndex = async (ownerEmail: string) => {
    try {
      const liftsCollectionRef = collection(db, 'Users', ownerEmail, 'Lifts');
      const liftsSnapshot = await getDocs(liftsCollectionRef);
      const existingLifts = liftsSnapshot.docs.map(doc => doc.id);
      
      let nextIndex = 1;
      while (existingLifts.includes(`Lift${nextIndex}`)) {
        nextIndex++;
      }
      
      return nextIndex;
    } catch (error) {
      console.error('Error getting next lift index:', error);
      return 1; // Default to 1 if error
    }
  };

  // Complete site conversion
  const handleCompleteSite = async () => {
    if (!site || !userProfile?.email || !userPassword.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setIsCreatingUser(true);

    try {
      const ownerEmail = (site as any).ownerEmail;
      if (!ownerEmail) {
        throw new Error('Owner email not found');
      }

      // Step 1: Create Users/{ownerEmail} document
      const addressLine2 = `${(site as any).city}, ${(site as any).state}, ${(site as any).pincode}`;
      
      const userDocData = {
        address: {
          addressLine1: (site as any).siteAddress || '',
          addressLine2: addressLine2,
          city: (site as any).city || '',
          state: (site as any).state || '',
          tower: '',
          flatNumber: (site as any).flat || '',
          pincode: (site as any).pincode || ''
        },
        email: ownerEmail,
        fullName: (site as any).ownerName || '',
        password: userPassword,
        phone: (site as any).ownerPhone || '',
        profileComplete: true,
        userId: (site as any).ownerUserId || ''
      };

      await setDoc(doc(db, 'Users', ownerEmail), userDocData);

      // Step 2: Get next lift index and create lift document
      const nextLiftIndex = await getNextLiftIndex(ownerEmail);
      const liftId = `Lift${nextLiftIndex}`;

      const currentDate = getCurrentDateFormatted();
      const fullAddress = `${(site as any).siteAddress}, ${(site as any).city}, ${(site as any).state}, ${(site as any).pincode}`;

      const liftDocData = {
        amcDetails: {
          amcType: (site as any).amcType || '',
          expiryDate: (site as any).amcExpiryDate || '',
          isUnderAMC: true,
          provider: 'Lubeck Elevators Pvt. Ltd.',
          startDate: (site as any).amcStartDate || ''
        },
        installationDate: currentDate,
        lastServiceDate: currentDate,
        liftID: (site as any).liftId || '',
        liftImage: 'https://lubeckelevators.com/_next/image?url=%2FGallery%2FIMPERIAL_GOLD_EDITION%2F1.jpg&w=1920&q=75',
        liftName: (site as any).liftName || '',
        location: {
          address: fullAddress,
          buildingName: (site as any).flat || '',
          floorRange: (site as any).floorsCount || 0
        },
        nextServiceDue: 'N/A',
        warrantyDetails: {
          warrantyExpiredOn: (site as any).warrantyExpiryDate || '',
          warrantyValid: true
        }
      };

      await setDoc(doc(db, 'Users', ownerEmail, 'Lifts', liftId), liftDocData);

      // Step 3: Update siteStatus in both paths
      const updateData = {
        siteStatus: 'Completed',
        updatedAt: new Date()
      };

      const updatePromises = [];

      // Update sites/{ownerEmail}
      updatePromises.push(
        updateDoc(doc(db, 'sites', ownerEmail), updateData)
      );

      // Update team/{userEmail}/sites/{ownerEmail}
      if (userProfile.email) {
        updatePromises.push(
          updateDoc(doc(db, 'team', userProfile.email, 'sites', ownerEmail), updateData)
        );
      }

      await Promise.all(updatePromises);

      // Success
      setCompleteSiteModalVisible(false);
      setUserPassword('');
      Alert.alert(
        'Success!', 
        'Site completed successfully! User account created and lift registered.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      console.error('Error completing site:', error);
      Alert.alert('Error', 'Failed to complete site conversion. Please try again.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if today's attendance is unmarked
  const isTodayUnmarked = () => {
    if (!site || !userProfile || !userProfile.email) return false;

    const todayDate = getTodayDate();
    const userEmail = userProfile.email;
    
    // Try to find existing record by date and either memberId (email or username)
    const todayRecord = site.attendanceRecords?.find(
      record => {
        return record.date === todayDate && (
          record.memberId === userEmail || 
          record.memberId === userProfile.name?.toLowerCase().replace(/\s+/g, '_') ||
          record.memberId === userEmail.split('@')[0] ||
          record.memberId.includes(userProfile.name?.split(' ')[0]?.toLowerCase() || '')
        );
      }
    );
    return !todayRecord || todayRecord.status === 'Unmarked';
  };

  // Mark attendance for today
  const markAttendance = async (status: 'Present' | 'Absent') => {
    if (!site || !userProfile) {
      Alert.alert('Error', 'Site or user information not available');
      return;
    }

    // Validate site ID
    const siteId = site.siteId || site.id;
    if (!siteId) {
      Alert.alert('Error', 'Site ID not available');
      return;
    }

    // Validate user email
    const userEmail = userProfile.email;
    if (!userEmail) {
      Alert.alert('Error', 'User email not available');
      return;
    }

    const todayDate = getTodayDate();

    try {
      // Update Firebase first
      console.log('Updating attendance for site:', siteId, 'user:', userEmail);
      const siteDocRef = doc(db, 'team', userEmail, 'sites', siteId);
      const siteDoc = await getDoc(siteDocRef);

      if (!siteDoc.exists()) {
        console.error('Site document not found:', siteId);
        Alert.alert('Error', 'Site document not found in database');
        return;
      }

      const siteData = siteDoc.data();
      console.log('Current site data:', siteData);

      // Ensure attendanceRecords exists
      const currentAttendanceRecords = Array.isArray(siteData?.attendanceRecords)
        ? siteData.attendanceRecords
        : [];
      console.log('Current attendance records:', currentAttendanceRecords);

      // Try to find existing record by date and either memberId (email or username)
      const existingRecordIndex = currentAttendanceRecords.findIndex(
        (record: AttendanceRecord) => {
          return record.date === todayDate && (
            record.memberId === userEmail || 
            record.memberId === userProfile.name?.toLowerCase().replace(/\s+/g, '_') ||
            record.memberId === userEmail.split('@')[0] ||
            record.memberId.includes(userProfile.name?.split(' ')[0]?.toLowerCase() || '')
          );
        }
      );

      console.log('Existing record index for today:', existingRecordIndex);
      console.log('Today date:', todayDate);
      console.log('User email:', userEmail);
      console.log('Looking for memberId matching:', userEmail, 'or', userProfile.name?.toLowerCase().replace(/\s+/g, '_'));

      let updatedAttendanceRecords = [...currentAttendanceRecords];

      if (existingRecordIndex !== -1) {
        // Update existing record
        console.log('Updating existing record at index:', existingRecordIndex);
        updatedAttendanceRecords[existingRecordIndex] = {
          ...updatedAttendanceRecords[existingRecordIndex],
          status: status
        };
      } else {
        // Create new record
        console.log('Creating new record for today');
        const newRecord: AttendanceRecord = {
          date: todayDate,
          memberId: userEmail,
          memberName: userProfile.name || 'Unknown User',
          siteId: siteId,
          status: status
        };
        updatedAttendanceRecords.push(newRecord);
      }

      console.log('Updated attendance records:', updatedAttendanceRecords);

      // Update Firebase
      const updateData = {
        attendanceRecords: updatedAttendanceRecords,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(siteDocRef, updateData);

      console.log('Successfully updated attendance in Firebase');

      // Update local state
      const updatedSite = {
        ...site,
        attendanceRecords: updatedAttendanceRecords
      };
      setSite(updatedSite);

      setAttendanceModalVisible(false);
      setLastMarkedStatus(status);
      setSuccessModalVisible(true);

    } catch (error) {
      console.error('Error updating attendance in Firebase:', error);
      Alert.alert('Error', 'Failed to update attendance. Please check your connection and try again.');
    }
  };

  // Calculate attendance statistics for the current user
  const calculateAttendanceStats = () => {
    if (!site || !site.attendanceRecords || !userProfile || !userProfile.email) {
      return { totalDays: 0, present: 0, absent: 0, unmarked: 0 };
    }

    const userEmail = userProfile.email;
    const currentUserRecords = site.attendanceRecords.filter(
      (record: AttendanceRecord) => {
        return record.memberId === userEmail ||
               record.memberId === userProfile.name?.toLowerCase().replace(/\s+/g, '_') ||
               record.memberId === userEmail.split('@')[0] ||
               record.memberId.includes(userProfile.name?.split(' ')[0]?.toLowerCase() || '');
      }
    );

    const totalDays = currentUserRecords.length;
    const present = currentUserRecords.filter(record => record.status === 'Present').length;
    const absent = currentUserRecords.filter(record => record.status === 'Absent').length;
    const unmarked = currentUserRecords.filter(record => record.status === 'Unmarked').length;

    return { totalDays, present, absent, unmarked };
  };

  if (!site) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading site details...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Main Screen Content */}
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{site.siteName || site.liftName}</Text>
          <Text style={styles.headerSubtitle}>{site.liftId}</Text>
        </View>
      </View>

        {/* Add spacing after header */}
        <View style={styles.headerSpacing} />

        <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

          {/* Owner Details */}
          <OwnerDetails
            ownerName={site.ownerName}
            ownerPhone={site.ownerPhone}
            ownerEmail={site.ownerEmail}
            ownerAadharUrl={site.ownerAadharUrl || undefined}
            ownerPanUrl={site.ownerPanUrl || undefined}
            ownerPhotoUrl={site.ownerPhotoUrl || undefined}
          />

          {/* Site Details */}
          <SiteDetails
            liftName={site.liftName}
            siteAddress={site.siteAddress}
            flat={site.flat}
            city={site.city}
            state={site.state}
            sitePinCode={site.pincode}
            typeOfSite={site.siteType}
            liftId={site.liftId}
            siteGoogleLocation={site.googleLocation}
            buildingElevationPhoto={site.buildingElevationUrl || undefined}
          />

          
          {/* Preworking Stage */}
          <PreworkingStage
            siteId={site.siteId || site.id}
            siteData={site}
            userEmail={userProfile?.email || ''}
            ownerEmail={(site as any).ownerEmail || undefined}
          />

          {/* Order Details */}
          <OrderDetails
            liftType={(site as any).liftType || undefined}
            floorsCount={(site as any).floorsCount || undefined}
            openingsCount={(site as any).openingsCount || undefined}
            shaftSize={(site as any).shaftSize || undefined}
            liftDrawingUrl={(site as any).liftDrawingUrl || undefined}
            lopType={(site as any).lopType || undefined}
            copType={(site as any).copType || undefined}
            copRfid={(site as any).copRfid || undefined}
            lopRfid={(site as any).lopRfid || undefined}
            cabinModel={(site as any).cabinModel || undefined}
            doorFrameType={(site as any).doorFrameType || undefined}
            licence={(site as any).licence || undefined}
            hasWarranty={(site as any).hasWarranty || undefined}
            warrantyExpiryDate={(site as any).warrantyExpiryDate || undefined}
            amcType={(site as any).amcType || undefined}
            amcProvider={(site as any).amcProvider || undefined}
            amcStartDate={(site as any).amcStartDate || undefined}
            amcExpiryDate={(site as any).amcExpiryDate || undefined}
          />







          {/* Technical Details */}
          <TechnicalDetails
            operationsStartDate={(site as any).operationsStartDate || undefined}
            operationsEndDate={(site as any).operationsEndDate || undefined}
            siteMapUrl={(site as any).siteMapUrl || undefined}
            additionalDocumentsUrls={(site as any).additionalDocumentsUrls || undefined}
            materialsList={(site as any).materialsList || undefined}
            userEmail={userProfile?.email || undefined}
            siteId={site.siteId || site.id || undefined}
            ownerEmail={(site as any).ownerEmail || undefined}
            onMaterialsUpdate={handleMaterialsUpdate}
          />

          {/* Installation Plan */}
          <InstallationPlan
            installationTasks={(site as any).installationTasks || undefined}
            userEmail={userProfile?.email || undefined}
            siteId={site.siteId || site.id || undefined}
            ownerEmail={(site as any).ownerEmail || undefined}
            onQualityCheckUpdate={handleQualityCheckUpdate}
          />

          {/* Attendance Statistics */}
          <View style={styles.attendanceCard}>
            <Text style={styles.cardTitle}>Attendance</Text>

            {/* Calendar */}
            <AttendanceCalendar
              attendanceRecords={site.attendanceRecords || []}
              operationsStartDate={site.operationsStartDate}
              operationsEndDate={site.operationsEndDate}
            />

            {/* Horizontal Stats */}
            <View style={styles.attendanceStatsVertical}>
              {/* Total Days */}
              <View style={styles.attendanceStatVertical}>
                <View style={[styles.attendanceStatIconVertical, styles.attendanceTotalIcon]}>
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
            </View>
                <View style={styles.attendanceStatInfoVertical}>
                  <Text style={styles.attendanceStatValueVertical}>{calculateAttendanceStats().totalDays}</Text>
                  <Text style={styles.attendanceStatLabelVertical}>Total</Text>
            </View>
            </View>

              {/* Present */}
              <View style={styles.attendanceStatVertical}>
                <View style={[styles.attendanceStatIconVertical, styles.attendancePresentIcon]}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          </View>
                <View style={styles.attendanceStatInfoVertical}>
                  <Text style={styles.attendanceStatValueVertical}>{calculateAttendanceStats().present}</Text>
                  <Text style={styles.attendanceStatLabelVertical}>Present</Text>
        </View>
          </View>

              {/* Absent */}
              <View style={styles.attendanceStatVertical}>
                <View style={[styles.attendanceStatIconVertical, styles.attendanceAbsentIcon]}>
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.attendanceStatInfoVertical}>
                  <Text style={styles.attendanceStatValueVertical}>{calculateAttendanceStats().absent}</Text>
                  <Text style={styles.attendanceStatLabelVertical}>Absent</Text>
              </View>
            </View>

              {/* Unmarked */}
              <View style={styles.attendanceStatVertical}>
                <View style={[styles.attendanceStatIconVertical, styles.attendanceUnmarkedIcon]}>
                  <Ionicons name="remove-circle" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.attendanceStatInfoVertical}>
                  <Text style={styles.attendanceStatValueVertical}>{calculateAttendanceStats().unmarked}</Text>
                  <Text style={styles.attendanceStatLabelVertical}>Unmarked</Text>
              </View>
              </View>
            </View>

            {/* Mark Attendance Button - Only show if unmarked */}
            {isTodayUnmarked() && (
              <View style={styles.attendanceButtonContainer}>
            <TouchableOpacity
                  style={styles.attendanceButton}
                  onPress={() => setAttendanceModalVisible(true)}
                  activeOpacity={0.8}
            >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
            </TouchableOpacity>
                </View>
            )}
        </View>

        {/* Complete Site Button - Only show if site is not completed */}
        {siteStatus !== 'Completed' && (
          <View style={styles.completeSiteButtonContainer}>
            <TouchableOpacity
              style={styles.completeSiteButton}
              onPress={() => setCompleteSiteModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done-circle" size={24} color={Colors.dark.text} />
              <Text style={styles.completeSiteButtonText}>Complete Site</Text>
            </TouchableOpacity>
          </View>
        )}

        </ScrollView>

      {/* Enhanced Attendance Modal */}
      <Modal
        visible={attendanceModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.attendanceModal}>
            {/* Modal Header with Icon */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIcon}>
                  <Ionicons name="calendar" size={24} color={Colors.dark.tint} />
              </View>
                <Text style={styles.modalTitle}>Daily Attendance</Text>
          </View>
              <TouchableOpacity
                onPress={() => setAttendanceModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.6}
              >
                <Ionicons name="close" size={24} color={Colors.dark.icon} />
              </TouchableOpacity>
        </View>

            {/* Today's Date */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Today</Text>
              <Text style={styles.dateValue}>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
          </View>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>Select your attendance status</Text>

            {/* Minimal Attendance Options */}
            <View style={styles.attendanceOptions}>
              <TouchableOpacity
                style={[styles.attendanceOption, styles.presentOption]}
                onPress={() => markAttendance('Present')}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                <Text style={styles.attendanceOptionText}>Present</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attendanceOption, styles.absentOption]}
                onPress={() => markAttendance('Absent')}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                <Text style={styles.attendanceOptionText}>Absent</Text>
              </TouchableOpacity>
          </View>

            {/* Footer Note */}
            <Text style={styles.footerNote}>
              Your attendance helps us track project progress
            </Text>
                </View>
                </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              </View>
            <Text style={styles.successTitle}>Attendance Marked!</Text>
            <Text style={styles.successMessage}>
              You have been marked as {lastMarkedStatus} for today
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Complete Site Modal */}
      <Modal
        visible={completeSiteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCompleteSiteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completeSiteModalContainer}>
            {/* Header */}
            <View style={styles.completeSiteModalHeader}>
              <Text style={styles.completeSiteModalTitle}>Creating The User</Text>
              <TouchableOpacity
                onPress={() => setCompleteSiteModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
          </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.completeSiteModalContent}>
                {/* Email Field (Auto-filled, Read-only) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email (Auto Filled)</Text>
                  <TextInput
                    style={[styles.textInput, styles.readOnlyInput]}
                    value={(site as any)?.ownerEmail || ''}
                    editable={false}
                    placeholder="Owner email will be auto-filled"
                    placeholderTextColor={Colors.dark.icon}
                  />
        </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <Text style={styles.inputHelper}>Ask The Team Member to ask user to fill this</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userPassword}
                    onChangeText={setUserPassword}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.dark.icon}
                    secureTextEntry={true}
                  />
          </View>

                {/* Create User Button */}
                <TouchableOpacity
                  style={[styles.createUserButton, isCreatingUser && styles.disabledButton]}
                  onPress={handleCompleteSite}
                  disabled={isCreatingUser || !userPassword.trim()}
                  activeOpacity={0.8}
                >
                  {isCreatingUser ? (
                    <>
                      <Ionicons name="sync" size={20} color="#FFFFFF" />
                      <Text style={styles.createUserButtonText}>Creating User...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="person-add" size={20} color="#FFFFFF" />
                      <Text style={styles.createUserButtonText}>Create User & Complete Site</Text>
                    </>
                  )}
                </TouchableOpacity>
            </View>
            </ScrollView>
            </View>
            </View>
      </Modal>
            </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.icon,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.tint,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },

  headerSpacing: {
    height: 20, // Add consistent spacing after header
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for floating button (100px button + 20px margin)
  },

  // New minimal styles
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Cards
  essentialCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workStatusCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warrantyCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Attendance Card
  attendanceCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Vertical attendance stats
  attendanceStatsVertical: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceStatVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  attendanceStatIconVertical: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceTotalIcon: {
    backgroundColor: Colors.dark.tint,
  },
  attendancePresentIcon: {
    backgroundColor: '#4CAF50',
  },
  attendanceAbsentIcon: {
    backgroundColor: '#F44336',
  },
  attendanceUnmarkedIcon: {
    backgroundColor: '#FF9800',
  },
  attendanceStatInfoVertical: {
    alignItems: 'center',
  },
  attendanceStatValueVertical: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  attendanceStatLabelVertical: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Calendar styles
  calendarContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
    textAlign: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: 'bold',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.icon,
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    width: '100%',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: '15.2857%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 4,
    minHeight: 45,
    position: 'relative',
    
  },
  currentMonthCell: {
    backgroundColor: Colors.dark.card,
  },
  otherMonthCell: {
    backgroundColor: Colors.dark.background,
    opacity: 0.3,
  },
  todayCell: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#DEB54B',
  },
  operationDayCell: {
    backgroundColor: 'rgba(47, 81, 47, 0.3)',
  },
  // Attendance status cell colors
  attendancePresentCell: {
    backgroundColor: '#1B5E20', // Very Dark Green for Present
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  attendanceAbsentCell: {
    backgroundColor: '#B71C1C', // Very Dark Red for Absent
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  // Text color for colored cells
  coloredCellText: {
    color: '#FFFFFF', // White text for colored backgrounds
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.dark.text,
  },

  // Card content
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 16,
  },

  // Essential card
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardItem: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: Colors.dark.tint + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginLeft: 8,
    flex: 1,
  },
  completeSiteButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30, // Extra bottom padding for better spacing
  },
  completeSiteButton: {
    backgroundColor: '#4CAF50', // Green color for completion
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    flexDirection: 'row' as const,
    gap: 12,
  },
  completeSiteButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '600' as const,
  },

  // Complete Site Modal Styles
  completeSiteModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    width: '90%' as const,
    maxWidth: 380,
    minHeight: 300,
    maxHeight: '75%' as const,
  },
  completeSiteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  completeSiteModalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.dark.text,
    flex: 1,
  },
  modalScrollView: {
    flexGrow: 1,
  },
  completeSiteModalContent: {
    padding: 20,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.dark.text,
    marginBottom: 6,
  },
  inputHelper: {
    fontSize: 11,
    color: Colors.dark.icon,
    marginBottom: 8,
    lineHeight: 14,
  },
  textInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: '#333333',
  },
  readOnlyInput: {
    backgroundColor: '#2A2A2A',
    color: '#888888',
    borderColor: '#444444',
  },
  createUserButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  createUserButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Status
  statusGrid: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '600',
    marginBottom: 8,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },

  // Tasks
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  taskName: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    color: Colors.dark.tint,
    fontWeight: '600',
  },

  // Team
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamCount: {
    alignItems: 'center',
  },
  teamCountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.tint,
  },
  teamCountLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
  },
  attendanceStats: {
    alignItems: 'flex-end',
  },
  attendanceStat: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  teamMembersList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniTeamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  miniTeamName: {
    fontSize: 14,
    color: Colors.dark.text,
    marginLeft: 6,
  },
  moreMembers: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontStyle: 'italic',
  },

  // Specs
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  specPair: {
    flex: 1,
    alignItems: 'center',
  },
  specName: {
    fontSize: 12,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  specData: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },

  // Warranty
  warrantyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warrantyInfo: {
    flex: 1,
  },
  warrantyStatus: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  warrantyExpiry: {
    fontSize: 12,
    color: Colors.dark.icon,
  },
  amcInfo: {
    alignItems: 'flex-end',
  },
  amcProvider: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  amcType: {
    fontSize: 12,
    color: Colors.dark.icon,
  },

  // Inline attendance button
  attendanceButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint, // App's golden theme color
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 300,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  attendanceButtonText: {
    color: '#FFFFFF', // Black text for better contrast on golden background
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Enhanced Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  attendanceModal: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  dateContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  attendanceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  attendanceOption: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  attendanceOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#FFFFFF',
  },
  presentOption: {
    borderWidth: 0,
    backgroundColor: '#4CAF50',
  },
  absentOption: {
    borderWidth: 0,
    backgroundColor: '#F44336',
  },
  footerNote: {
    fontSize: 12,
    color: Colors.dark.icon,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },

  // Success Modal
  successModal: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.dark.icon,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

});


