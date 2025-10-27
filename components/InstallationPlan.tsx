import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import { db } from '../firebase/firebaseConfig';

interface InstallationPlanProps {
  installationTasks?: { [key: string]: string };
  userEmail?: string;
  siteId?: string;
  ownerEmail?: string;
  siteData?: any; // Full site data for finding document ID
  onQualityCheckUpdate?: (updatedChecks: { [key: string]: string }) => void;
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

const InstallationPlan: React.FC<InstallationPlanProps> = ({
  installationTasks,
  userEmail,
  siteId,
  ownerEmail,
  siteData,
  onQualityCheckUpdate,
}) => {
  const { userProfile } = useUser();
  const [viewPlanModalVisible, setViewPlanModalVisible] = useState(false);
  const [qualityCheckModalVisible, setQualityCheckModalVisible] = useState(false);
  const [selectedQualityCheck, setSelectedQualityCheck] = useState<{ name: string; currentStatus: string } | null>(null);

  // Check if user has permission to update quality checks
  const canUpdateQualityChecks = userProfile?.role === 'quality_check_mechanic';
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Find today's installation task
  const getTodaysTask = () => {
    if (!installationTasks) return null;

    const today = getCurrentDate();
    const todaysTask = Object.entries(installationTasks)
      .filter(([taskName]) => !taskName.toLowerCase().includes('quality') && !taskName.toLowerCase().includes('check') && !taskName.toLowerCase().includes('final') && !taskName.toLowerCase().includes('checkup'))
      .find(([task, date]) => date === today);

    return todaysTask ? { name: todaysTask[0], date: todaysTask[1] } : null;
  };

  const todaysTask = getTodaysTask();

  const openViewPlanModal = () => {
    setViewPlanModalVisible(true);
  };

  const closeViewPlanModal = () => {
    setViewPlanModalVisible(false);
  };

  const openQualityCheckModal = (checkName: string, currentStatus: string) => {
    setSelectedQualityCheck({ name: checkName, currentStatus });
    setQualityCheckModalVisible(true);
  };

  const closeQualityCheckModal = () => {
    setQualityCheckModalVisible(false);
    setSelectedQualityCheck(null);
  };

  const updateQualityCheckStatus = async (newStatus: string) => {
    if (selectedQualityCheck && userEmail && siteId && qualityChecks) {
      try {
        const updatedInstallationTasks = {
          ...installationTasks,
          [selectedQualityCheck.name]: newStatus
        };

        const updateData = {
          installationTasks: updatedInstallationTasks,
          updatedAt: new Date()
        };

        const updatePromises = [];

        // Update team/{userEmail}/sites/{siteId}
        const teamSiteDocRef = doc(db, 'team', userEmail, 'sites', siteId);
        updatePromises.push(
          updateDoc(teamSiteDocRef, updateData)
        );

        // Update sites/{sitesDocId} if ownerEmail and siteData are available
        if (ownerEmail && siteData) {
          const sitesDocId = await findSitesDocumentId(ownerEmail, siteData);
          if (sitesDocId) {
            const ownerSiteDocRef = doc(db, 'sites', sitesDocId);
            updatePromises.push(
              updateDoc(ownerSiteDocRef, updateData)
            );
          }
        }

        // Wait for both updates to complete
        await Promise.all(updatePromises);

        // Update local state if callback provided
        if (onQualityCheckUpdate) {
          onQualityCheckUpdate(updatedInstallationTasks);
        }

        console.log(`✅ Updated quality check in ${ownerEmail ? 'both' : 'team'} paths: ${selectedQualityCheck.name} = ${newStatus}`);

        closeQualityCheckModal();
      } catch (error) {
        console.error('Error updating quality check:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const isDatePassed = (taskDate: string) => {
    const today = new Date(getCurrentDate());
    const date = new Date(taskDate);
    return date < today;
  };

  // Extract quality checks from installationTasks
  const getQualityChecksFromTasks = () => {
    if (!installationTasks) return {};

    const qualityChecks: { [key: string]: string } = {};

    Object.entries(installationTasks).forEach(([taskName, taskValue]) => {
      if ((taskName.toLowerCase().includes('quality') ||
          taskName.toLowerCase().includes('check')) &&
          !taskName.toLowerCase().includes('finalcheckup')) {
        qualityChecks[taskName] = taskValue as string;
      }
    });

    // Sort quality checks: QualityCheck1, QualityCheck2, QualityCheck3, then others
    const sortedEntries = Object.entries(qualityChecks).sort(([a], [b]) => {
      const getOrder = (name: string) => {
        if (name.toLowerCase() === 'qualitycheck1') return 1;
        if (name.toLowerCase() === 'qualitycheck2') return 2;
        if (name.toLowerCase() === 'qualitycheck3') return 3;
        return 4; // Other quality checks come last
      };

      return getOrder(a) - getOrder(b);
    });

    return Object.fromEntries(sortedEntries);
  };

  const qualityChecks = getQualityChecksFromTasks();

  // Format task name for display (convert camelCase to readable text)
  const formatTaskName = (taskName: string) => {
    return taskName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  return (
    <>
      <View style={installationStyles.container}>
        <Text style={installationStyles.title}>Installation Plan</Text>

        <View style={installationStyles.contentContainer}>
          {/* Today's Task */}
          <View style={installationStyles.taskContainer}>
            <View style={installationStyles.taskIconContainer}>
              <Ionicons name="construct" size={24} color={Colors.dark.tint} />
            </View>
            <View style={installationStyles.taskContent}>
              <Text style={installationStyles.taskLabel}>Today's Task:</Text>
              <Text style={installationStyles.taskValue}>
                {todaysTask ? formatTaskName(todaysTask.name) : 'No task scheduled'}
              </Text>
              {todaysTask && (
                <Text style={installationStyles.taskDate}>
                  {new Date(todaysTask.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              )}
            </View>
          </View>

          {/* View Plan Button */}
          <TouchableOpacity style={installationStyles.viewPlanButton} onPress={openViewPlanModal} activeOpacity={0.8}>
            <Ionicons name="calendar" size={20} color={Colors.dark.text} />
            <Text style={installationStyles.viewPlanButtonText}>View Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

    {/* View Plan Modal */}
    <Modal
      visible={viewPlanModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeViewPlanModal}
    >
      <View style={installationStyles.modalOverlay}>
        <View style={installationStyles.viewPlanModalContainer}>
          <View style={installationStyles.modalHeader}>
            <View style={installationStyles.modalHeaderLeft}>
              <Text style={installationStyles.modalTitle}>Installation Plan Details</Text>
            </View>
            <TouchableOpacity onPress={closeViewPlanModal} style={installationStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={installationStyles.modalScrollView}
            contentContainerStyle={installationStyles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={installationStyles.planContainer}>
              {/* Installation Tasks Section */}
              <View style={installationStyles.planSection}>
                <Text style={installationStyles.sectionTitle}>Installation Tasks</Text>
                {installationTasks && Object.keys(installationTasks).length > 0 ? (() => {
                  const tasks = installationTasks;
                  return Object.entries(tasks || {})
                    .filter(([taskName]) => !taskName.toLowerCase().includes('quality') && !taskName.toLowerCase().includes('check') && !taskName.toLowerCase().includes('final') && !taskName.toLowerCase().includes('checkup'))
                    .sort(([, dateA], [, dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                    .map(([taskName, taskDate]) => {
                      const datePassed = isDatePassed(taskDate);
                      return (
                        <View key={taskName} style={installationStyles.taskItem}>
                          <View style={installationStyles.taskIconContainer}>
                            {datePassed ? (
                              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            ) : (
                              <Ionicons name="construct" size={20} color={Colors.dark.tint} />
                            )}
                          </View>
                          <View style={installationStyles.taskItemContent}>
                            <Text style={[
                              installationStyles.taskItemName,
                              datePassed && installationStyles.completedTaskName
                            ]}>
                              {formatTaskName(taskName)}
                            </Text>
                            <Text style={installationStyles.taskItemDate}>
                              {new Date(taskDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          </View>
                          {datePassed && (
                            <View style={installationStyles.completionBadge}>
                              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            </View>
                          )}
                        </View>
                      );
                    });
                })() : (
                  <View style={installationStyles.emptySection}>
                    <Ionicons name="construct" size={32} color={Colors.dark.icon} />
                    <Text style={installationStyles.emptySectionText}>No installation tasks found</Text>
                  </View>
                )}
              </View>

              {/* Quality Checks Section */}
              <View style={installationStyles.planSection}>
                <View style={installationStyles.sectionHeader}>
                  <Text style={installationStyles.sectionTitle}>Quality Checks</Text>
                  {!canUpdateQualityChecks && (
                    <View style={installationStyles.permissionBadge}>
                      <Ionicons name="lock-closed" size={14} color={Colors.dark.icon} />
                      {/* <Text style={installationStyles.permissionText}>Quality Check Mechanic Only</Text> */}
                    </View>
                  )}
                </View>
                {qualityChecks && Object.keys(qualityChecks).length > 0 ? (() => {
                  const checks = qualityChecks;
                  return Object.entries(checks || {}).map(([checkName, checkStatus]) => {
                    const isCompleted = checkStatus.toLowerCase() === 'passed' || checkStatus.toLowerCase() === 'failed';
                    const canModify = canUpdateQualityChecks && !isCompleted;

                    return (
                      <TouchableOpacity
                        key={checkName}
                        style={[
                          installationStyles.qualityCheckItem,
                          !canModify && installationStyles.disabledItem
                        ]}
                        onPress={() => canModify && openQualityCheckModal(checkName, checkStatus)}
                        activeOpacity={canModify ? 0.7 : 1}
                        disabled={!canModify}
                      >
                        <View style={installationStyles.qualityIconContainer}>
                          <Ionicons
                            name={checkStatus.toLowerCase() === 'passed' ? 'checkmark-circle' : checkStatus.toLowerCase() === 'failed' ? 'close-circle' : 'help-circle'}
                            size={20}
                            color={checkStatus.toLowerCase() === 'passed' ? '#4CAF50' : checkStatus.toLowerCase() === 'failed' ? '#F44336' : Colors.dark.icon}
                          />
                          {isCompleted && (
                            <View style={installationStyles.lockIcon}>
                              <Ionicons name="lock-closed" size={12} color={Colors.dark.icon} />
                            </View>
                          )}
                        </View>
                        <View style={installationStyles.qualityCheckContent}>
                          <Text style={installationStyles.qualityCheckName}>
                            {checkName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                          </Text>
                          <View style={[
                            installationStyles.qualityStatusBadge,
                            checkStatus.toLowerCase() === 'passed' && installationStyles.passedBadge,
                            checkStatus.toLowerCase() === 'failed' && installationStyles.failedBadge
                          ]}>
                            <Text style={installationStyles.qualityStatusText}>
                              {checkStatus}
                            </Text>
                          </View>
                        </View>
                        <View style={installationStyles.qualityArrowContainer}>
                          <Ionicons name="chevron-forward" size={20} color={Colors.dark.icon} />
                        </View>
                      </TouchableOpacity>
                    );
                  });
                })() : (
                  <View style={installationStyles.emptySection}>
                    <Ionicons name="shield-checkmark" size={32} color={Colors.dark.icon} />
                    <Text style={installationStyles.emptySectionText}>No quality checks found</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Quality Check Modal */}
    <Modal
      visible={qualityCheckModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeQualityCheckModal}
    >
      <View style={installationStyles.modalOverlay}>
        <View style={installationStyles.qualityModalContainer}>
          <View style={installationStyles.modalHeader}>
            <View style={installationStyles.modalHeaderLeft}>
              <Text style={installationStyles.modalTitle}>Update Quality Check</Text>
            </View>
            <TouchableOpacity onPress={closeQualityCheckModal} style={installationStyles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          {selectedQualityCheck && (
            <View style={installationStyles.qualityModalContent}>
              <View style={installationStyles.selectedCheckInfo}>
                <View style={installationStyles.qualityIconContainer}>
                  <Ionicons
                    name={selectedQualityCheck.currentStatus.toLowerCase() === 'passed' ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={selectedQualityCheck.currentStatus.toLowerCase() === 'passed' ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={installationStyles.selectedCheckContent}>
                  <Text style={installationStyles.selectedCheckName}>
                    {selectedQualityCheck.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                  </Text>
                  <Text style={installationStyles.selectedCheckStatus}>
                    Current: {selectedQualityCheck.currentStatus}
                  </Text>
                </View>
              </View>

              <Text style={installationStyles.modalSubtitle}>Mark as:</Text>

              <View style={installationStyles.statusOptionsContainer}>
                <TouchableOpacity
                  style={[
                    installationStyles.statusOption,
                    selectedQualityCheck.currentStatus.toLowerCase() === 'passed' && installationStyles.selectedOption
                  ]}
                  onPress={() => updateQualityCheckStatus('Passed')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={installationStyles.statusOptionText}>Passed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    installationStyles.statusOption,
                    selectedQualityCheck.currentStatus.toLowerCase() === 'failed' && installationStyles.selectedOption
                  ]}
                  onPress={() => updateQualityCheckStatus('Failed')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                  <Text style={installationStyles.statusOptionText}>Failed</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
    </>
  );
};

// Installation Plan Styles
const installationStyles = {
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
  contentContainer: {
    gap: 16,
  },
  taskContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  taskValue: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
  },
  viewPlanButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
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
  viewPlanButtonText: {
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
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
  },
  permissionBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  permissionText: {
    fontSize: 10,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  viewPlanModalContainer: {
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
  planContainer: {
    gap: 24,
  },
  planSection: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  taskItemContent: {
    flex: 1,
  },
  taskItemName: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  taskItemDate: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
  },
  completedTaskName: {
    color: Colors.dark.icon,
  },
  completionBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  qualityArrowContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingRight: 8,
  },
  qualityModalContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.85,
    maxHeight: Dimensions.get('window').height * 0.6,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  qualityModalContent: {
    padding: 20,
  },
  selectedCheckInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedCheckContent: {
    flex: 1,
  },
  selectedCheckName: {
    fontSize: 18,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  selectedCheckStatus: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  statusOptionsContainer: {
    gap: 12,
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
  selectedOption: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.card,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.dark.text,
    marginLeft: 12,
  },
  qualityCheckItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledItem: {
    opacity: 0.6,
  },
  qualityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  lockIcon: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    backgroundColor: Colors.dark.card,
    borderRadius: 6,
    padding: 2,
  },
  qualityCheckContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  qualityCheckName: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600' as const,
  },
  qualityStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center' as const,
  },
  passedBadge: {
    backgroundColor: '#4CAF50',
  },
  failedBadge: {
    backgroundColor: '#F44336',
  },
  qualityStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  emptySection: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
    gap: 12,
  },
  emptySectionText: {
    fontSize: 16,
    color: Colors.dark.icon,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
};

export default InstallationPlan;
