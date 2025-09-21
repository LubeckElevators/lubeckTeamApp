import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface OrderDetailsProps {
  liftType?: string;
  floorsCount?: string | number;
  openingsCount?: string | number;
  shaftSize?: string;
  liftDrawingUrl?: string;
  lopType?: string;
  copType?: string;
  copRfid?: string;
  lopRfid?: string;
  cabinModel?: string;
  doorFrameType?: string;
  licence?: string;
  hasWarranty?: string;
  warrantyExpiryDate?: string;
  amcType?: string;
  amcProvider?: string;
  amcStartDate?: string;
  amcExpiryDate?: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  liftType,
  floorsCount,
  openingsCount,
  shaftSize,
  liftDrawingUrl,
  lopType,
  copType,
  copRfid,
  lopRfid,
  cabinModel,
  doorFrameType,
  licence,
  hasWarranty,
  warrantyExpiryDate,
  amcType,
  amcProvider,
  amcStartDate,
  amcExpiryDate,
}) => {
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

  const openDetailsModal = () => {
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
  };

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

  return (
    <View style={orderStyles.container}>
      <Text style={orderStyles.title}>Order Details</Text>

      {/* Main Info Display */}
      <View style={orderStyles.mainInfoContainer}>
        <View style={orderStyles.infoRow}>
          <Ionicons name="construct" size={20} color={Colors.dark.icon} />
          <Text style={orderStyles.infoLabel}>Lift Type:</Text>
          <Text style={orderStyles.infoValue}>{liftType || 'Not specified'}</Text>
        </View>

        <View style={orderStyles.infoRow}>
          <Ionicons name="layers" size={20} color={Colors.dark.icon} />
          <Text style={orderStyles.infoLabel}>Floors:</Text>
          <Text style={orderStyles.infoValue}>{floorsCount || 'N/A'}</Text>
        </View>

        <View style={orderStyles.infoRow}>
          <Ionicons name="resize" size={20} color={Colors.dark.icon} />
          <Text style={orderStyles.infoLabel}>Openings:</Text>
          <Text style={orderStyles.infoValue}>{openingsCount || 'N/A'}</Text>
        </View>

        <View style={orderStyles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.dark.icon} />
          <Text style={orderStyles.infoLabel}>Warranty:</Text>
          <Text style={orderStyles.infoValue}>{hasWarranty || 'N/A'}</Text>
        </View>
      </View>

      {/* View Details Button */}
      <TouchableOpacity style={orderStyles.detailsButton} onPress={openDetailsModal} activeOpacity={0.8}>
        <Ionicons name="list" size={20} color={Colors.dark.text} />
        <Text style={orderStyles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailsModal}
      >
        <View style={orderStyles.modalOverlay}>
          <View style={orderStyles.detailsModalContainer}>
            <View style={orderStyles.modalHeader}>
              <View style={orderStyles.modalHeaderLeft}>
                <Text style={orderStyles.modalTitle}>Complete Order Details</Text>
              </View>
              <TouchableOpacity onPress={closeDetailsModal} style={orderStyles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={orderStyles.modalScrollView}
              contentContainerStyle={orderStyles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <View style={orderStyles.detailsContainer}>
                {/* Basic Information */}
                <View style={orderStyles.section}>
                  <Text style={orderStyles.sectionTitle}>Basic Information</Text>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="construct" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Lift Type</Text>
                      <Text style={orderStyles.detailValue}>{liftType || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="layers" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>No of Floors</Text>
                      <Text style={orderStyles.detailValue}>{floorsCount || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="resize" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Total No of Openings</Text>
                      <Text style={orderStyles.detailValue}>{openingsCount || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="expand" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Shaft Size</Text>
                      <Text style={orderStyles.detailValue}>{shaftSize || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="document" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Lift Drawing</Text>
                      <Text style={orderStyles.detailValue}>
                        {liftDrawingUrl ? 'Uploaded' : 'Not uploaded'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Lift Drawing Preview */}
                {liftDrawingUrl && (
                  <View style={orderStyles.section}>
                    <View style={orderStyles.sectionHeader}>
                      <Ionicons name="document" size={20} color={Colors.dark.tint} />
                      <Text style={orderStyles.sectionTitle}>Lift Drawing Preview</Text>
                    </View>
                    <View style={orderStyles.sectionContent}>
                      <TouchableOpacity
                        onPress={() => openImageModal(liftDrawingUrl, 'Lift Drawing')}
                        style={orderStyles.enhancedBuildingImageContainer}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: liftDrawingUrl }} style={orderStyles.enhancedBuildingImage} />
                        <View style={orderStyles.enhancedBuildingImageOverlay}>
                          <View style={orderStyles.enhancedBuildingImageOverlayContent}>
                            <View style={orderStyles.enhancedBuildingImageOverlayIcon}>
                              <Ionicons name="document" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={orderStyles.enhancedBuildingImageOverlayText}>Tap to view full image</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Control Panels */}
                <View style={orderStyles.section}>
                  <Text style={orderStyles.sectionTitle}>Control Panels</Text>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="radio-button-on" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>LOP (Landing Operation Panel)</Text>
                      <Text style={orderStyles.detailValue}>{lopType || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="radio-button-on" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>COP (Car Operation Panel)</Text>
                      <Text style={orderStyles.detailValue}>{copType || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="wifi" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>COP RFID</Text>
                      <Text style={orderStyles.detailValue}>{copRfid || 'Not Available'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="wifi" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>LOP RFID</Text>
                      <Text style={orderStyles.detailValue}>{lopRfid || 'Not Available'}</Text>
                    </View>
                  </View>
                </View>

                {/* Cabin & Design */}
                <View style={orderStyles.section}>
                  <Text style={orderStyles.sectionTitle}>Cabin & Design</Text>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="car" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Cabin Model</Text>
                      <Text style={orderStyles.detailValue}>{cabinModel || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="grid" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Door and Frame Type</Text>
                      <Text style={orderStyles.detailValue}>{doorFrameType || 'Not specified'}</Text>
                    </View>
                  </View>
                </View>

                {/* Legal & Warranty */}
                <View style={orderStyles.section}>
                  <Text style={orderStyles.sectionTitle}>Legal & Warranty</Text>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="document-text" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Licence</Text>
                      <Text style={orderStyles.detailValue}>{licence || 'To Be Provided'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="shield-checkmark" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Has Warranty</Text>
                      <Text style={orderStyles.detailValue}>{hasWarranty || 'N/A'}</Text>
                    </View>
                  </View>

                  {hasWarranty === 'YES' && (
                    <View style={orderStyles.detailRow}>
                      <View style={orderStyles.detailIconContainer}>
                        <Ionicons name="calendar" size={20} color={Colors.dark.tint} />
                      </View>
                      <View style={orderStyles.detailTextContainer}>
                        <Text style={orderStyles.detailLabel}>Expires On</Text>
                        <Text style={orderStyles.detailValue}>{warrantyExpiryDate || 'mm/dd/yyyy'}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* AMC Details */}
                <View style={orderStyles.section}>
                  <Text style={orderStyles.sectionTitle}>AMC Details</Text>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="shield-checkmark" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>AMC Type</Text>
                      <Text style={orderStyles.detailValue}>{amcType || 'Enter AMC type'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="business" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Provider</Text>
                      <Text style={orderStyles.detailValue}>{amcProvider || 'Lubeck Elevators Pvt. Ltd.'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="calendar" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Start Date</Text>
                      <Text style={orderStyles.detailValue}>{amcStartDate || 'mm/dd/yyyy'}</Text>
                    </View>
                  </View>

                  <View style={orderStyles.detailRow}>
                    <View style={orderStyles.detailIconContainer}>
                      <Ionicons name="calendar-outline" size={20} color={Colors.dark.tint} />
                    </View>
                    <View style={orderStyles.detailTextContainer}>
                      <Text style={orderStyles.detailLabel}>Expiry Date</Text>
                      <Text style={orderStyles.detailValue}>{amcExpiryDate || 'mm/dd/yyyy'}</Text>
                    </View>
                  </View>
                </View>
              </View>
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
        <View style={orderStyles.modalOverlay}>
          <View style={orderStyles.imageModalContainer}>
            <View style={orderStyles.modalHeader}>
              <View style={orderStyles.modalHeaderLeft}>
                <Text style={orderStyles.modalTitle}>{selectedImageTitle}</Text>
              </View>
              <TouchableOpacity onPress={closeImageModal} style={orderStyles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
            {selectedImageUrl && (
              <Image
                source={{ uri: selectedImageUrl }}
                style={orderStyles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Order Details Styles
const orderStyles = {
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
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    flex: 1,
  },
  detailsButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row' as const,
    gap: 8,
  },
  detailsButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
  },
  detailsContainer: {
    gap: 20,
  },
  section: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
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
  },
  imageModalContainer: {
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
  fullImage: {
    width: '100%' as const,
    height: Dimensions.get('window').height * 0.7,
    backgroundColor: Colors.dark.background,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionContent: {
    gap: 12,
  },
  enhancedBuildingImageContainer: {
    width: '100%' as const,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedBuildingImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.dark.background,
  },
  enhancedBuildingImageOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  enhancedBuildingImageOverlayContent: {
    alignItems: 'center' as const,
    gap: 8,
  },
  enhancedBuildingImageOverlayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  enhancedBuildingImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
};

export default OrderDetails;
