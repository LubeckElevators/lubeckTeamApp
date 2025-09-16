import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const openLocation = (url: string) => {
    Linking.openURL(url);
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
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Site Type</Text>
              <Text style={styles.infoValue}>{site.siteType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Lift Type</Text>
              <Text style={styles.infoValue}>{site.liftType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Floors</Text>
              <Text style={styles.infoValue}>{site.floorsCount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Openings</Text>
              <Text style={styles.infoValue}>{site.openingsCount}</Text>
            </View>
          </View>
        </View>

        {/* Owner Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Owner Information</Text>
          </View>
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{site.ownerName}</Text>
              <Text style={styles.ownerId}>{site.ownerUserId}</Text>
            </View>
            <View style={styles.ownerContact}>
              <TouchableOpacity style={styles.contactItem}>
                <Ionicons name="call" size={16} color={Colors.dark.tint} />
                <Text style={styles.contactText}>{site.ownerPhone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem}>
                <Ionicons name="mail" size={16} color={Colors.dark.tint} />
                <Text style={styles.contactText}>{site.ownerEmail}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.locationCard}>
            <Text style={styles.addressText}>
              {site.siteAddress}, {site.city}, {site.state} - {site.pincode}
            </Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => openLocation(site.googleLocation)}
            >
              <Ionicons name="navigate" size={16} color={Colors.dark.tint} />
              <Text style={styles.locationButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress & Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Progress & Timeline</Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Installation Progress</Text>
              <Text style={styles.progressStep}>Step {site.currentStep} of 7</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((site.currentStep / 7) * 100, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {Math.min(Math.round((site.currentStep / 7) * 100), 100)}% Complete
            </Text>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Key Dates</Text>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Operations Start</Text>
              <Text style={styles.timelineValue}>{formatDate(site.operationsStartDate)}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Operations End</Text>
              <Text style={styles.timelineValue}>{formatDate(site.operationsEndDate)}</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Assigned Date</Text>
              <Text style={styles.timelineValue}>{formatDate(site.assignedDate)}</Text>
            </View>
          </View>
        </View>

        {/* Work Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Work Status</Text>
          </View>

          <View style={styles.workStatusGrid}>
            <View style={styles.workStatusCard}>
              <View style={styles.workStatusHeader}>
                <Text style={styles.workStatusTitle}>Civil Work</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.civilWork?.status) }]}>
                  <Text style={styles.statusText}>{site.civilWork?.status || 'Unknown'}</Text>
                </View>
              </View>
              <View style={styles.workDetails}>
                <Text style={styles.workDetail}>RCC Entrance: {(site.civilWork?.rccEntrance) ? '✓' : '✗'}</Text>
                <Text style={styles.workDetail}>Shaft Plaster: {(site.civilWork?.shaftPlaster) ? '✓' : '✗'}</Text>
                <Text style={styles.workDetail}>Front Wall: {(site.civilWork?.frontWallElevation) ? '✓' : '✗'}</Text>
                <Text style={styles.workDetail}>Water Proofing: {(site.civilWork?.pitWaterProofing) ? '✓' : '✗'}</Text>
              </View>
            </View>

            <View style={styles.workStatusCard}>
              <View style={styles.workStatusHeader}>
                <Text style={styles.workStatusTitle}>Electrical Work</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.electricalWork?.status) }]}>
                  <Text style={styles.statusText}>{site.electricalWork?.status || 'Unknown'}</Text>
                </View>
              </View>
              <View style={styles.workDetails}>
                <Text style={styles.workDetail}>MCB Box: {(site.electricalWork?.mcbBox) ? '✓' : '✗'}</Text>
                <Text style={styles.workDetail}>Earthing Wire: {(site.electricalWork?.earthingWire) ? '✓' : '✗'}</Text>
                <Text style={styles.workDetail}>3-Phase Connection: {(site.electricalWork?.threePhaseConnection) ? '✓' : '✗'}</Text>
              </View>
            </View>

            <View style={styles.workStatusCard}>
              <View style={styles.workStatusHeader}>
                <Text style={styles.workStatusTitle}>Stairs Work</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.stairsWork?.status) }]}>
                  <Text style={styles.statusText}>{site.stairsWork?.status || 'Unknown'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Installation Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Installation Tasks</Text>
          </View>

          <View style={styles.tasksGrid}>
            {Object.entries(site.installationTasks || {}).map(([task, date]) => (
              <View key={task} style={styles.taskItem}>
                <Text style={styles.taskName}>{task.replace(/([A-Z])/g, ' $1').trim()}</Text>
                <Text style={styles.taskDate}>{formatDate(date)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Team Members</Text>
          </View>

          <View style={styles.teamList}>
            {(site.assignedTeamMembers || []).map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <Ionicons name="person-circle" size={24} color={Colors.dark.tint} />
                <Text style={styles.teamMemberName}>{member}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
          </View>

          <View style={styles.attendanceList}>
            {(site.attendanceRecords || []).slice(0, 7).map((record, index) => (
              <View key={index} style={styles.attendanceItem}>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceMember}>{record.memberName}</Text>
                  <Text style={styles.attendanceDate}>{formatDate(record.date)}</Text>
                </View>
                <View style={[styles.attendanceStatus, { backgroundColor: getAttendanceStatusColor(record.status) }]}>
                  <Text style={styles.attendanceStatusText}>{record.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Technical Specifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Cabin Model</Text>
              <Text style={styles.specValue}>{site.cabinModel}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Door Frame</Text>
              <Text style={styles.specValue}>{site.doorFrameType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>COP Type</Text>
              <Text style={styles.specValue}>{site.copType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>LOP Type</Text>
              <Text style={styles.specValue}>{site.lopType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Shaft Size</Text>
              <Text style={styles.specValue}>{site.shaftSize || 'Not specified'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Flat</Text>
              <Text style={styles.specValue}>{site.flat}</Text>
            </View>
          </View>
        </View>

        {/* Warranty & AMC */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.dark.tint} />
            <Text style={styles.sectionTitle}>Warranty & AMC</Text>
          </View>

          <View style={styles.warrantyCard}>
            <View style={styles.warrantyItem}>
              <Text style={styles.warrantyLabel}>Warranty Status</Text>
              <Text style={styles.warrantyValue}>{site.hasWarranty}</Text>
            </View>
            <View style={styles.warrantyItem}>
              <Text style={styles.warrantyLabel}>Warranty Expiry</Text>
              <Text style={styles.warrantyValue}>{formatDate(site.warrantyExpiryDate)}</Text>
            </View>
            <View style={styles.warrantyItem}>
              <Text style={styles.warrantyLabel}>AMC Provider</Text>
              <Text style={styles.warrantyValue}>{site.amcProvider || 'Not assigned'}</Text>
            </View>
            <View style={styles.warrantyItem}>
              <Text style={styles.warrantyLabel}>AMC Type</Text>
              <Text style={styles.warrantyValue}>{site.amcType || 'Not specified'}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
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

  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 8,
  },

  // Basic Info
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },

  // Owner
  ownerCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  ownerInfo: {
    marginBottom: 12,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  ownerId: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  ownerContact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    padding: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.dark.text,
    marginLeft: 8,
  },

  // Location
  locationCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  addressText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.dark.tint + '20',
    borderRadius: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: Colors.dark.tint,
    marginLeft: 8,
    fontWeight: '600',
  },

  // Progress
  progressCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  progressStep: {
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.tint,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    color: Colors.dark.icon,
    textAlign: 'center',
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: Colors.dark.icon,
  },
  timelineValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },

  // Work Status
  workStatusGrid: {
    gap: 12,
  },
  workStatusCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  workStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  workDetails: {
    gap: 8,
  },
  workDetail: {
    fontSize: 14,
    color: Colors.dark.icon,
  },

  // Tasks
  tasksGrid: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  taskItem: {
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
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: '600',
  },

  // Team
  teamList: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  teamMemberName: {
    fontSize: 16,
    color: Colors.dark.text,
    marginLeft: 12,
  },

  // Attendance
  attendanceList: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceMember: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  attendanceDate: {
    fontSize: 12,
    color: Colors.dark.icon,
  },
  attendanceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendanceStatusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Specs
  specsGrid: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.dark.icon,
  },
  specValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },

  // Warranty
  warrantyCard: {
    backgroundColor: Colors.dark.card || '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  warrantyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  warrantyLabel: {
    fontSize: 14,
    color: Colors.dark.icon,
  },
  warrantyValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
});
