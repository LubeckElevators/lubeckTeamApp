import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface SiteDetailsProps {
  liftName?: string;
  siteAddress?: string;
  flat?: string;
  city?: string;
  state?: string;
  sitePinCode?: string;
  typeOfSite?: string;
  liftId?: string;
  siteGoogleLocation?: string;
  buildingElevationPhoto?: string;
}

const SiteDetails: React.FC<SiteDetailsProps> = ({
  liftName,
  siteAddress,
  flat,
  city,
  state,
  sitePinCode,
  typeOfSite,
  liftId,
  siteGoogleLocation,
  buildingElevationPhoto,
}) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [preworkModalVisible, setPreworkModalVisible] = useState(false);
  const [selectedWorkStage, setSelectedWorkStage] = useState<string>('');

  const openImageModal = (url: string, title: string) => {
    setSelectedImageUrl(url);
    setSelectedImageTitle(title);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImageUrl(null);
    setSelectedImageTitle('');
  };

  const openDetailsModal = () => {
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
  };

  const openPreworkModal = (workStage: string) => {
    setSelectedWorkStage(workStage);
    setPreworkModalVisible(true);
  };

  const closePreworkModal = () => {
    setPreworkModalVisible(false);
    setSelectedWorkStage('');
  };

  const openLocation = (url: string) => {
    Linking.openURL(url);
  };

  // Preworking stage data
  const preworkStages = [
    {
      id: 'civil',
      title: 'CIVIL WORK',
      status: 'Incomplete',
      items: [
        'FRONT WALL ELEVATION',
        'SHAFT PLASTER',
        'WHITE WASH',
        'PIT WATER PROOFING',
        'RCC ENTRANCE RCC',
        'ENTRANCE BEAM AT 88" FROM FLOOR LEVEL',
        'U TYPE DUAL LOAD HOOK INSIDE SHAFT',
        'MRL 2.5 FT X 2.5 FT WINDOW',
        'STAIR FOR TERRACE'
      ]
    },
    {
      id: 'electrical',
      title: 'ELECTRICAL WORK',
      status: 'Incomplete',
      items: [
        'ACTIVE THREE PHASE 6 MM WIRE CONNECTION WITH MCB BOX WITH SUPPLY',
        '63 AMP 300 MA MCB FOR LIFT POWER SUPPLY',
        'DUAL GI / COPPER EARTHING WIRE IN MCB BOX'
      ]
    },
    {
      id: 'stairs',
      title: 'STAIRS MARBLE WORK OR FLOOR LEVEL',
      status: 'Incomplete',
      items: []
    },
    {
      id: 'lift',
      title: 'LIFT SQUARE FOLDING',
      status: 'Incomplete',
      items: []
    }
  ];

  const DetailRow = ({
    label,
    value,
    icon,
    onPress,
    isLink = false,
    isRequired = false
  }: {
    label: string;
    value?: string;
    icon?: string;
    onPress?: () => void;
    isLink?: boolean;
    isRequired?: boolean;
  }) => (
    <View style={styles.detailRow}>
      <View style={styles.labelContainer}>
        <Text style={[styles.detailLabel, isRequired && styles.requiredLabel]}>
          {label}
        </Text>
        {isRequired && <Text style={styles.asterisk}>*</Text>}
      </View>
      <View style={styles.valueContainer}>
        {value ? (
          onPress ? (
            <TouchableOpacity onPress={onPress} style={styles.linkContainer}>
              <Text style={[styles.detailValue, isLink && styles.linkText]}>
                {value}
              </Text>
              {icon && <Ionicons name={icon as any} size={16} color={Colors.dark.tint} style={styles.linkIcon} />}
            </TouchableOpacity>
          ) : (
            <Text style={styles.detailValue}>{value}</Text>
          )
        ) : (
          <Text style={styles.emptyValue}>-</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Site Details</Text>

      {/* Main Site Information */}
      <View style={styles.mainInfoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="business" size={20} color={Colors.dark.icon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Lift Name</Text>
            <Text style={styles.infoValue}>{liftName || 'Not specified'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="home" size={20} color={Colors.dark.icon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Flat</Text>
            <Text style={styles.infoValue}>{flat || 'Not specified'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={Colors.dark.icon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Site Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {siteAddress || 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.locationButton]}
          onPress={() => siteGoogleLocation && openLocation(siteGoogleLocation)}
          activeOpacity={0.8}
          disabled={!siteGoogleLocation}
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>View Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={openDetailsModal}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>Complete Site Details</Text>
              </View>
              <TouchableOpacity onPress={closeDetailsModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              {/* Basic Information Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="business" size={20} color={Colors.dark.tint} />
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.enhancedDetailRow}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="construct" size={18} color={Colors.dark.icon} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Lift Name</Text>
                      <Text style={styles.detailValue}>{liftName || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={styles.enhancedDetailRow}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="location" size={18} color={Colors.dark.icon} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Site Address</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>{siteAddress || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={styles.enhancedDetailRow}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="home" size={18} color={Colors.dark.icon} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Flat</Text>
                      <Text style={styles.detailValue}>{flat || 'Not specified'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location Information Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="navigate" size={20} color={Colors.dark.tint} />
                  <Text style={styles.sectionTitle}>Location Details</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.locationGrid}>
                    <View style={styles.locationItem}>
                      <Ionicons name="map" size={16} color={Colors.dark.icon} />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>City</Text>
                        <Text style={styles.locationValue}>{city || 'Not specified'}</Text>
                      </View>
                    </View>

                    <View style={styles.locationItem}>
                      <Ionicons name="compass" size={16} color={Colors.dark.icon} />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>State</Text>
                        <Text style={styles.locationValue}>{state || 'Not specified'}</Text>
                      </View>
                    </View>

                    <View style={styles.locationItem}>
                      <Ionicons name="pin" size={16} color={Colors.dark.icon} />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>Pin Code</Text>
                        <Text style={styles.locationValue}>{sitePinCode || 'Not specified'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Classification Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pricetag" size={20} color={Colors.dark.tint} />
                  <Text style={styles.sectionTitle}>Classification</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.classificationCard}>
                    <Ionicons name="home" size={20} color={Colors.dark.icon} />
                    <View style={styles.classificationTextContainer}>
                      <Text style={styles.classificationLabel}>Type of Site</Text>
                      <Text style={styles.classificationValue}>{typeOfSite || 'Not specified'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* System Generated Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cog" size={20} color={Colors.dark.tint} />
                  <Text style={styles.sectionTitle}>System Generated</Text>
                </View>
                <View style={styles.sectionContent}>
                  <View style={styles.systemInfoCard}>
                    <Ionicons name="key" size={18} color={Colors.dark.icon} />
                    <View style={styles.systemInfoTextContainer}>
                      <Text style={styles.systemInfoLabel}>Lift ID</Text>
                      <Text style={styles.systemInfoValue}>{liftId || 'Not generated'}</Text>
                    </View>
                  </View>

                  {siteGoogleLocation && (
                    <TouchableOpacity
                      style={styles.googleMapsCard}
                      onPress={() => openLocation(siteGoogleLocation)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-google" size={20} color={Colors.dark.tint} />
                      <View style={styles.googleMapsTextContainer}>
                        <Text style={styles.googleMapsLabel}>Google Maps</Text>
                        <Text style={styles.googleMapsValue}>View Location</Text>
                      </View>
                      <Ionicons name="open-outline" size={16} color={Colors.dark.icon} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Building Elevation Photo */}
              {buildingElevationPhoto && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="camera" size={20} color={Colors.dark.tint} />
                    <Text style={styles.sectionTitle}>Building Photo</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <TouchableOpacity
                      onPress={() => openImageModal(buildingElevationPhoto, 'Building Elevation Photo')}
                      style={styles.enhancedBuildingImageContainer}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: buildingElevationPhoto }} style={styles.enhancedBuildingImage} />
                      <View style={styles.enhancedBuildingImageOverlay}>
                        <View style={styles.enhancedBuildingImageOverlayContent}>
                          <View style={styles.enhancedBuildingImageOverlayIcon}>
                            <Ionicons name="business" size={24} color="#FFFFFF" />
                          </View>
                          <Text style={styles.enhancedBuildingImageOverlayText}>Tap to view full image</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imageModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>{selectedImageTitle}</Text>
              </View>
              <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            {selectedImageUrl && (
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    marginBottom: 16,
  },
  mainInfoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButton: {
    backgroundColor: Colors.dark.tint,
  },
  detailsButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  detailsModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.85,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    paddingTop: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
    gap: 8,
  },
  sectionContent: {
    gap: 8,
  },
  enhancedDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 56,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    flexShrink: 0,
  },
  detailTextContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  locationGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    minWidth: '45%' as const,
    padding: 10,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationTextContainer: {
    marginLeft: 6,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  classificationCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  classificationTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  classificationLabel: {
    fontSize: 11,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  classificationValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  systemInfoCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  systemInfoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  systemInfoLabel: {
    fontSize: 11,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  systemInfoValue: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: '500' as const,
    fontFamily: 'monospace' as const,
  },
  googleMapsCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.dark.tint,
  },
  googleMapsTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  googleMapsLabel: {
    fontSize: 11,
    color: Colors.dark.tint,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  googleMapsValue: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  enhancedBuildingImageContainer: {
    position: 'relative' as const,
    width: '100%' as const,
    height: 140,
    borderRadius: 10,
    overflow: 'hidden' as const,
    backgroundColor: Colors.dark.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  enhancedBuildingImage: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: 12,
  },
  enhancedBuildingImageOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 12,
    padding: 16,
  },
  enhancedBuildingImageOverlayContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  enhancedBuildingImageOverlayIcon: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    padding: 14,
  },
  enhancedBuildingImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    minHeight: 48,
  },
  labelContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  requiredLabel: {
    color: Colors.dark.text,
  },
  asterisk: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 4,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end' as const,
  },
  emptyValue: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontStyle: 'italic' as const,
  },
  linkContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  linkText: {
    color: Colors.dark.tint,
    textDecorationLine: 'underline' as const,
  },
  linkIcon: {
    marginLeft: 4,
  },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  imageSection: {
    marginTop: 12,
  },
  imageLabel: {
    fontSize: 13,
    color: Colors.dark.icon,
    textTransform: 'uppercase' as const,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  buildingImageContainer: {
    position: 'relative' as const,
    width: '100%' as const,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden' as const,
    backgroundColor: Colors.dark.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  buildingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  buildingImageOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 12,
    padding: 16,
  },
  buildingImageOverlayContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buildingImageOverlayIcon: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 12,
  },
  buildingImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  imageModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  modalHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
  },
  fullImage: {
    width: '100%' as const,
    height: Dimensions.get('window').height * 0.6,
    backgroundColor: Colors.dark.background,
  },
};

export default SiteDetails;
