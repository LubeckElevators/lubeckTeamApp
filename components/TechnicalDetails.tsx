import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { db } from '../firebase/firebaseConfig';

interface MaterialItem {
  name: string;
  status?: string;
}

interface TechnicalDetailsProps {
  operationsStartDate?: string;
  operationsEndDate?: string;
  siteMapUrl?: string;
  additionalDocumentsUrls?: string[];
  materialsList?: MaterialItem[];
  userEmail?: string;
  siteId?: string;
  ownerEmail?: string;
  siteData?: any; // Full site data for finding document ID
  onMaterialsUpdate?: (updatedMaterials: MaterialItem[]) => void;
}

// Helper function to find the actual document ID in sites collection
const findSitesDocumentId = async (ownerEmail: string, siteData: any): Promise<string | null> => {
  try {
    const sitesCollectionRef = collection(db, 'sites');
    const sitesSnapshot = await getDocs(sitesCollectionRef);

    for (const doc of sitesSnapshot.docs) {
      const docData = doc.data();
      // Match by ownerEmail and key identifying fields
      if (docData.ownerEmail === ownerEmail &&
          docData.liftId === siteData.liftId &&
          docData.siteAddress === siteData.siteAddress) {
        return doc.id;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding sites document ID:', error);
    return null;
  }
};

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  operationsStartDate,
  operationsEndDate,
  siteMapUrl,
  additionalDocumentsUrls,
  materialsList,
  userEmail,
  siteId,
  ownerEmail,
  siteData,
  onMaterialsUpdate,
}) => {
  const [docsModalVisible, setDocsModalVisible] = useState(false);
  const [materialsModalVisible, setMaterialsModalVisible] = useState(false);
  const [statusChangeModalVisible, setStatusChangeModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Placed' | 'OUT FOR DELIVERY' | 'Delivered'>('Placed');

  // Filter materials by status
  const filteredMaterials = useMemo(() => {
    if (!materialsList) return [];
    return materialsList.filter(material => {
      const status = material.status?.toLowerCase();
      switch (activeTab) {
        case 'Placed':
          return status === 'placed' || status === 'pending';
        case 'OUT FOR DELIVERY':
          return status === 'out for delivery' || status === 'in transit' || status === 'shipping';
        case 'Delivered':
          return status === 'delivered' || status === 'completed' || status === 'received';
        default:
          return true;
      }
    });
  }, [materialsList, activeTab]);

  const openDocsModal = () => {
    setDocsModalVisible(true);
  };

  const closeDocsModal = () => {
    setDocsModalVisible(false);
  };

  const openMaterialsModal = () => {
    setMaterialsModalVisible(true);
  };

  const closeMaterialsModal = () => {
    setMaterialsModalVisible(false);
  };

  const openStatusChangeModal = (material: MaterialItem) => {
    setSelectedMaterial(material);
    setStatusChangeModalVisible(true);
  };

  const closeStatusChangeModal = () => {
    setStatusChangeModalVisible(false);
    setSelectedMaterial(null);
  };

  const updateMaterialStatus = async (newStatus: string) => {
    if (!selectedMaterial || !userEmail || !siteId) {
      console.error('Missing required data for status update');
      return;
    }

    try {
      const updatedMaterialsList = materialsList?.map((material: MaterialItem) => {
        if (material.name === selectedMaterial.name) {
          return { ...material, status: newStatus };
        }
        return material;
      }) || [];

      // Update both Firebase paths
      const updatePromises = [];

      // Update team/{userEmail}/sites/{siteId}
      const teamSiteDocRef = doc(db, 'team', userEmail, 'sites', siteId);
      updatePromises.push(
        updateDoc(teamSiteDocRef, {
          materialsList: updatedMaterialsList,
          updatedAt: new Date()
        })
      );

      // Update sites/{sitesDocId} if ownerEmail and siteData are available
      if (ownerEmail && siteData) {
        const sitesDocId = await findSitesDocumentId(ownerEmail, siteData);
        if (sitesDocId) {
          const ownerSiteDocRef = doc(db, 'sites', sitesDocId);
          updatePromises.push(
            updateDoc(ownerSiteDocRef, {
              materialsList: updatedMaterialsList,
              updatedAt: new Date()
            })
          );
        }
      }

      // Wait for both updates to complete
      await Promise.all(updatePromises);

      console.log(`Successfully updated ${selectedMaterial.name} status to: ${newStatus} in ${ownerEmail ? 'both' : 'team'} Firebase paths`);

      // Update local state immediately for instant UI feedback
      if (onMaterialsUpdate && materialsList) {
        const updatedLocalMaterials = materialsList.map((material: MaterialItem) => {
          if (material.name === selectedMaterial.name) {
            return { ...material, status: newStatus };
          }
          return material;
        });
        onMaterialsUpdate(updatedLocalMaterials);
      }

      closeStatusChangeModal();

      // Optional: Show success feedback (could add a toast notification here)

    } catch (error) {
      console.error('Error updating material status:', error);
      // Optional: Show error feedback (could add a toast notification here)
    }
  };

  const openDocumentModal = (url: string, title: string) => {
    setSelectedDocUrl(url);
    setSelectedDocTitle(title);
  };

  const closeDocumentModal = () => {
    setSelectedDocUrl(null);
    setSelectedDocTitle('');
  };

  return (
    <>
      <View style={technicalStyles.container}>
        <Text style={technicalStyles.title}>Technical Details</Text>

        {/* Operations Dates */}
        <View style={technicalStyles.datesContainer}>
          <View style={technicalStyles.dateRow}>
            <Ionicons name="calendar" size={20} color={Colors.dark.icon} />
            <Text style={technicalStyles.dateLabel}>Operations Start Date:</Text>
            <Text style={technicalStyles.dateValue}>{operationsStartDate || 'Not set'}</Text>
          </View>

          <View style={technicalStyles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.dark.icon} />
            <Text style={technicalStyles.dateLabel}>Operations End Date:</Text>
            <Text style={technicalStyles.dateValue}>{operationsEndDate || 'Not set'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={technicalStyles.buttonsContainer}>
        <TouchableOpacity style={technicalStyles.actionButton} onPress={openMaterialsModal} activeOpacity={0.8}>
          <Ionicons name="list" size={20} color={Colors.dark.text} />
          <Text style={technicalStyles.buttonText}>Material List</Text>
        </TouchableOpacity>

          <TouchableOpacity style={technicalStyles.actionButton} onPress={openDocsModal} activeOpacity={0.8}>
            <Ionicons name="document-text" size={20} color={Colors.dark.text} />
            <Text style={technicalStyles.buttonText}>View Docs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Documents Modal */}
      <Modal
        visible={docsModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeDocsModal}
    >
      <View style={technicalStyles.modalOverlay}>
        <View style={technicalStyles.docsModalContainer}>
          <View style={technicalStyles.modalHeader}>
            <View style={technicalStyles.modalHeaderLeft}>
              <Text style={technicalStyles.modalTitle}>Project Documents</Text>
            </View>
            <TouchableOpacity onPress={closeDocsModal} style={technicalStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={technicalStyles.modalScrollView}
            contentContainerStyle={technicalStyles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={technicalStyles.docsContainer}>
              {/* Site Map Section */}
              <View style={technicalStyles.docSection}>
                <Text style={technicalStyles.sectionTitle}>Site Map</Text>
                {siteMapUrl ? (
                  <TouchableOpacity
                    onPress={() => openDocumentModal(siteMapUrl, 'Site Map')}
                    style={technicalStyles.docPreviewContainer}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: siteMapUrl }} style={technicalStyles.docPreview} />
                    <View style={technicalStyles.docPreviewOverlay}>
                      <View style={technicalStyles.docPreviewOverlayContent}>
                        <View style={technicalStyles.docPreviewOverlayIcon}>
                          <Ionicons name="map" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={technicalStyles.docPreviewOverlayText}>Tap to view full document</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={technicalStyles.noDocContainer}>
                    <Ionicons name="map" size={32} color={Colors.dark.icon} />
                    <Text style={technicalStyles.noDocText}>No site map available</Text>
                  </View>
                )}
              </View>

              {/* Additional Documents Section */}
              <View style={technicalStyles.docSection}>
                <Text style={technicalStyles.sectionTitle}>Additional Documents</Text>
                {additionalDocumentsUrls && additionalDocumentsUrls.length > 0 ? (
                  <View style={technicalStyles.additionalDocsGrid}>
                    {additionalDocumentsUrls.map((docUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => openDocumentModal(docUrl, `Document ${index + 1}`)}
                        style={technicalStyles.additionalDocItem}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: docUrl }} style={technicalStyles.additionalDocImage} />
                        <View style={technicalStyles.additionalDocOverlay}>
                          <Ionicons name="document" size={20} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={technicalStyles.noDocContainer}>
                    <Ionicons name="document-text" size={32} color={Colors.dark.icon} />
                    <Text style={technicalStyles.noDocText}>No additional documents available</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Materials List Modal */}
    <Modal
      visible={materialsModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMaterialsModal}
    >
      <View style={technicalStyles.modalOverlay}>
        <View style={technicalStyles.docsModalContainer}>
          <View style={technicalStyles.modalHeader}>
            <View style={technicalStyles.modalHeaderLeft}>
              <Text style={technicalStyles.modalTitle}>Materials List</Text>
            </View>
            <TouchableOpacity onPress={closeMaterialsModal} style={technicalStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {/* Material Status Tabs */}
          <View style={technicalStyles.tabsContainer}>
            {(['Placed', 'OUT FOR DELIVERY', 'Delivered'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  technicalStyles.tab,
                  activeTab === tab && technicalStyles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[
                  technicalStyles.tabText,
                  activeTab === tab && technicalStyles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={technicalStyles.modalScrollView}
            contentContainerStyle={technicalStyles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={technicalStyles.materialsContainer}>
              {filteredMaterials && filteredMaterials.length > 0 ? (
                filteredMaterials.map((material, index) => {
                  const isDelivered = material.status?.toLowerCase() === 'delivered';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={technicalStyles.materialItem}
                      onPress={() => !isDelivered && openStatusChangeModal(material)}
                      activeOpacity={isDelivered ? 1 : 0.7}
                      disabled={isDelivered}
                    >
                      <View style={technicalStyles.materialIconContainer}>
                        <Ionicons name="cube" size={22} color={Colors.dark.text} />
                        {isDelivered && (
                          <View style={technicalStyles.materialLockIcon}>
                            <Ionicons name="lock-closed" size={12} color={Colors.dark.icon} />
                          </View>
                        )}
                      </View>
                    <View style={technicalStyles.materialTextContainer}>
                      <Text style={technicalStyles.materialText}>{material.name}</Text>
                      <View style={technicalStyles.materialStatusBadge}>
                        <Text style={technicalStyles.materialStatusText}>
                          {material.status || 'No Status'}
                        </Text>
                      </View>
                    </View>
                      <View style={technicalStyles.materialArrow}>
                        <Ionicons name="chevron-forward" size={24} color={Colors.dark.icon} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={technicalStyles.noDocContainer}>
                  <Ionicons name="cube" size={32} color={Colors.dark.icon} />
                  <Text style={technicalStyles.noDocText}>
                    No {activeTab.toLowerCase()} materials found
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Status Change Modal */}
    <Modal
      visible={statusChangeModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeStatusChangeModal}
    >
      <View style={technicalStyles.modalOverlay}>
        <View style={technicalStyles.statusModalContainer}>
          <View style={technicalStyles.modalHeader}>
            <View style={technicalStyles.modalHeaderLeft}>
              <Text style={technicalStyles.modalTitle}>Change Material Status</Text>
            </View>
            <TouchableOpacity onPress={closeStatusChangeModal} style={technicalStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {selectedMaterial && (
            <View style={technicalStyles.statusModalContent}>
              {/* Material Info */}
              <View style={technicalStyles.selectedMaterialInfo}>
                <View style={technicalStyles.materialIconContainer}>
                  <Ionicons name="cube" size={24} color="#FFFFFF" />
                </View>
                <View style={technicalStyles.selectedMaterialTextContainer}>
                  <Text style={technicalStyles.selectedMaterialName}>{selectedMaterial.name}</Text>
                  <Text style={technicalStyles.currentStatusText}>
                    Current: {selectedMaterial.status || 'No Status'}
                  </Text>
                </View>
              </View>

              {/* Status Options */}
              <View style={technicalStyles.statusOptionsContainer}>
                <Text style={technicalStyles.statusOptionsTitle}>Select New Status:</Text>

                {[
                  { label: 'Placed', value: 'Placed', icon: 'cart' },
                  { label: 'Out for Delivery', value: 'Out for Delivery', icon: 'car' },
                  { label: 'Delivered', value: 'Delivered', icon: 'checkmark-circle' }
                ].filter((option) => {
                  // Prevent backward transitions based on current status
                  const currentStatus = selectedMaterial?.status?.toLowerCase();

                  if (currentStatus === 'delivered') {
                    // Cannot change from Delivered to anything
                    return false;
                  } else if (currentStatus === 'out for delivery') {
                    // Can only change to Delivered
                    return option.value === 'Delivered';
                  } else {
                    // Can change to any status from Placed
                    return true;
                  }
                }).map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      technicalStyles.statusOption,
                      selectedMaterial.status === option.value && technicalStyles.selectedStatusOption
                    ]}
                    onPress={() => updateMaterialStatus(option.value)}
                    activeOpacity={0.8}
                  >
                    <View style={technicalStyles.statusOptionIcon}>
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={[
                      technicalStyles.statusOptionText,
                      selectedMaterial.status === option.value && technicalStyles.selectedStatusOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {selectedMaterial.status === option.value && (
                      <View style={technicalStyles.currentStatusIndicator}>
                        <Ionicons name="checkmark" size={16} color={Colors.dark.text} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* Document Preview Modal */}
    <Modal
      visible={!!selectedDocUrl}
      transparent={true}
      animationType="fade"
      onRequestClose={closeDocumentModal}
    >
      <View style={technicalStyles.modalOverlay}>
        <View style={technicalStyles.docModalContainer}>
          <View style={technicalStyles.modalHeader}>
            <View style={technicalStyles.modalHeaderLeft}>
              <Text style={technicalStyles.modalTitle}>{selectedDocTitle}</Text>
            </View>
            <TouchableOpacity onPress={closeDocumentModal} style={technicalStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
          {selectedDocUrl && (
            <Image
              source={{ uri: selectedDocUrl }}
              style={technicalStyles.fullDocImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
    </>
  );
};

// Technical Details Styles
const technicalStyles = {
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
  datesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
    minWidth: 140,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row' as const,
    gap: 8,
  },
  buttonText: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  docsModalContainer: {
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
  docModalContainer: {
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
  fullDocImage: {
    width: '100%' as const,
    height: Dimensions.get('window').height * 0.7,
    backgroundColor: Colors.dark.background,
  },
  docsContainer: {
    gap: 20,
  },
  docSection: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  docPreviewContainer: {
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
  docPreview: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.dark.background,
  },
  docPreviewOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  docPreviewOverlayContent: {
    alignItems: 'center' as const,
    gap: 8,
  },
  docPreviewOverlayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  docPreviewOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noDocContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 16,
    marginHorizontal: 0,
    marginVertical: 20,
    backgroundColor: Colors.dark.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.card,
    borderStyle: 'dashed' as const,
  },
  noDocText: {
    fontSize: 16,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  additionalDocsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  additionalDocItem: {
    width: '48%' as const,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalDocImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.dark.background,
  },
  additionalDocOverlay: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  activeTab: {
    backgroundColor: Colors.dark.tint,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.dark.icon,
    textAlign: 'center' as const,
  },
  activeTabText: {
    color: Colors.dark.text,
    fontWeight: '600' as const,
  },
  materialsContainer: {
    gap: 12,
  },
  materialItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 0,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  materialIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  materialLockIcon: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    backgroundColor: Colors.dark.card,
    borderRadius: 6,
    padding: 2,
  },
  materialTextContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  materialText: {
    fontSize: 17,
    color: Colors.dark.text,
    fontWeight: '700' as const,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  materialSubtitle: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  materialStatusBadge: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start' as const,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '80',
  },
  materialStatusText: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  materialArrow: {
    marginLeft: 12,
    opacity: 0.6,
  },
  statusModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.7,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  statusModalContent: {
    padding: 20,
  },
  selectedMaterialInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedMaterialTextContainer: {
    flex: 1,
  },
  selectedMaterialName: {
    fontSize: 18,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  currentStatusText: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
  },
  statusOptionsContainer: {
    gap: 12,
  },
  statusOptionsTitle: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStatusOption: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  statusOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500' as const,
  },
  selectedStatusOptionText: {
    color: Colors.dark.text,
    fontWeight: '600' as const,
  },
  currentStatusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.text,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

export default TechnicalDetails;
