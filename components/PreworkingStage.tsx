import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { db } from '../firebase/firebaseConfig';

interface PreworkingStageProps {
  siteId: string;
  siteData: any;
  userEmail: string;
  ownerEmail?: string;
}

const PreworkingStage: React.FC<PreworkingStageProps> = ({ siteId, siteData, userEmail, ownerEmail }) => {
  const [preworkModalVisible, setPreworkModalVisible] = useState(false);
  const [selectedWorkStage, setSelectedWorkStage] = useState<string>('');
  const [checkedItems, setCheckedItems] = useState<{[key: string]: {[key: string]: boolean}}>({
    civil: {},
    electrical: {},
    stairs: {},
    lift: {}
  });
  const [originalCheckedItems, setOriginalCheckedItems] = useState<{[key: string]: {[key: string]: boolean}}>({
    civil: {},
    electrical: {},
    stairs: {},
    lift: {}
  });
  const [savingChanges, setSavingChanges] = useState(false);

  // Initialize checked items from Firebase data
  React.useEffect(() => {
    if (siteData) {
      const newCheckedItems: {[key: string]: {[key: string]: boolean}} = {
        civil: {},
        electrical: {},
        stairs: {},
        lift: {}
      };

      // Load existing data from Firebase
      if (siteData.civilWork) {
        Object.entries(siteData.civilWork).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            newCheckedItems.civil[key] = value;
          }
        });
      }

      if (siteData.electricalWork) {
        Object.entries(siteData.electricalWork).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            newCheckedItems.electrical[key] = value;
          }
        });
      }

      if (siteData.stairsWork) {
        Object.entries(siteData.stairsWork).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            newCheckedItems.stairs[key] = value;
          }
        });
      }

      if (siteData.liftSquareFolding) {
        Object.entries(siteData.liftSquareFolding).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            newCheckedItems.lift[key] = value;
          }
        });
      }

      setCheckedItems(newCheckedItems);
      setOriginalCheckedItems(JSON.parse(JSON.stringify(newCheckedItems))); // Deep copy
    }
  }, [siteData]);

  const openPreworkModal = (workStage: string) => {
    setSelectedWorkStage(workStage);
    // Set original state when opening modal to track changes
    setOriginalCheckedItems(JSON.parse(JSON.stringify(checkedItems)));
    setPreworkModalVisible(true);
  };

  const closePreworkModal = () => {
    setPreworkModalVisible(false);
    setSelectedWorkStage('');
    // Reset to original state when closing without saving
    setCheckedItems(JSON.parse(JSON.stringify(originalCheckedItems)));
  };

  const updateFirebaseChecklist = async (stageId: string, itemId: string, newValue: boolean) => {
    if (!userEmail || !siteId) return;

    try {
      const siteDocRef = doc(db, 'team', userEmail, 'sites', siteId);
      const stage = preworkStages.find(s => s.id === stageId);
      if (!stage) return;

      // Prepare the update object
      const updateData: any = {};
      updateData[`${stage.firebaseField}.${itemId}`] = newValue;

      // Update Firebase
      await updateDoc(siteDocRef, updateData);

      console.log(`✅ Updated Firebase: ${stage.firebaseField}.${itemId} = ${newValue}`);
    } catch (error) {
      console.error('❌ Error updating Firebase:', error);
      // Revert local state on error
      setCheckedItems(prev => ({
        ...prev,
        [stageId]: {
          ...prev[stageId],
          [itemId]: !newValue
        }
      }));
    }
  };

  const toggleChecklistItem = (stageId: string, itemId: string) => {
    const newValue = !checkedItems[stageId]?.[itemId];

    // Only update local state - no Firebase call
    setCheckedItems(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        [itemId]: newValue
      }
    }));
  };

  const hasChanges = (stageId: string) => {
    const currentStage = checkedItems[stageId] || {};
    const originalStage = originalCheckedItems[stageId] || {};
    return JSON.stringify(currentStage) !== JSON.stringify(originalStage);
  };

  const isStageComplete = (stageId: string) => {
    const stage = preworkStages.find(s => s.id === stageId);
    if (!stage || stage.items.length === 0) return false;

    return stage.items.every(item => checkedItems[stageId]?.[item.id]);
  };

  const getStageStatus = (stage: any) => {
    // First check if all items are completed in current state
    if (isStageComplete(stage.id)) {
      return "Complete";
    }
    // Fallback to Firebase data if available
    return siteData?.[stage.firebaseField]?.status || "Incomplete";
  };

  const getButtonText = (stageId: string) => {
    const stage = preworkStages.find(s => s.id === stageId);
    if (!stage) return "Save";

    // If no checklist items, always show "Mark as Complete"
    if (stage.items.length === 0) {
      return "Mark as Complete";
    }

    // If has items and all are complete, show "Mark Complete"
    if (isStageComplete(stageId)) {
      return "Mark Complete";
    }

    // If has items but not all complete, show "Save"
    return "Save";
  };

  const saveChanges = async () => {
    if (!userEmail || !siteId || !selectedWorkStage) return;

    setSavingChanges(true);

    try {
      const stage = preworkStages.find(s => s.id === selectedWorkStage);
      if (!stage) return;

      // Prepare update data for all items in this stage
      const updateData: any = {};
      const currentStageItems = checkedItems[selectedWorkStage] || {};

      stage.items.forEach(item => {
        const currentValue = currentStageItems[item.id] || false;
        updateData[`${stage.firebaseField}.${item.id}`] = currentValue;
      });

      // Update status based on completion state
      const isComplete = isStageComplete(selectedWorkStage);
      if (isComplete) {
        updateData[`${stage.firebaseField}.status`] = "Complete";
        console.log(`✅ Stage ${selectedWorkStage} marked as Complete`);
      } else {
        updateData[`${stage.firebaseField}.status`] = "Incomplete";
        console.log(`⚠️ Stage ${selectedWorkStage} marked as Incomplete (not all items checked)`);
      }

      // Update both Firebase paths
      const updatePromises = [];

      // Update team/{userEmail}/sites/{siteId}
      const teamSiteDocRef = doc(db, 'team', userEmail, 'sites', siteId);
      updatePromises.push(
        updateDoc(teamSiteDocRef, updateData)
      );

      // Update sites/{ownerEmail} if ownerEmail is available
      if (ownerEmail) {
        const ownerSiteDocRef = doc(db, 'sites', ownerEmail);
        updatePromises.push(
          updateDoc(ownerSiteDocRef, updateData)
        );
      }

      // Wait for both updates to complete
      await Promise.all(updatePromises);

      // Update original state to reflect saved changes
      setOriginalCheckedItems(JSON.parse(JSON.stringify(checkedItems)));

      console.log(`✅ Updated Firebase in ${ownerEmail ? 'both' : 'team'} paths: ${stage.firebaseField} with ${Object.keys(updateData).length} items`);

      // Close modal after successful save
      setPreworkModalVisible(false);
      setSelectedWorkStage('');

    } catch (error) {
      console.error('❌ Error updating Firebase:', error);
      // Don't revert local state on error - user can try again
    } finally {
      setSavingChanges(false);
    }
  };

  // Preworking stage data with Firebase field names
  const preworkStages = [
    {
      id: 'civil',
      title: 'CIVIL WORK',
      firebaseField: 'civilWork',
      status: 'Incomplete',
      items: [
        { id: 'frontWallElevation', label: 'FRONT WALL ELEVATION', firebaseField: 'frontWallElevation' },
        { id: 'shaftPlaster', label: 'SHAFT PLASTER', firebaseField: 'shaftPlaster' },
        { id: 'whiteWash', label: 'WHITE WASH', firebaseField: 'whiteWash' },
        { id: 'pitWaterProofing', label: 'PIT WATER PROOFING', firebaseField: 'pitWaterProofing' },
        { id: 'rccEntrance', label: 'RCC ENTRANCE RCC', firebaseField: 'rccEntrance' },
        { id: 'entranceBeam', label: 'ENTRANCE BEAM AT 88" FROM FLOOR LEVEL', firebaseField: 'entranceBeam' },
        { id: 'dualLoadHook', label: 'U TYPE DUAL LOAD HOOK INSIDE SHAFT', firebaseField: 'dualLoadHook' },
        { id: 'mrlWindow', label: 'MRL 2.5 FT X 2.5 FT WINDOW', firebaseField: 'mrlWindow' },
        { id: 'stairTerrace', label: 'STAIR FOR TERRACE', firebaseField: 'stairTerrace' }
      ]
    },
    {
      id: 'electrical',
      title: 'ELECTRICAL WORK',
      firebaseField: 'electricalWork',
      status: 'Incomplete',
      items: [
        { id: 'activeThreePhase', label: 'ACTIVE THREE PHASE 6 MM WIRE CONNECTION WITH MCB BOX WITH SUPPLY', firebaseField: 'activeThreePhase' },
        { id: 'mcbBox', label: '63 AMP 300 MA MCB FOR LIFT POWER SUPPLY', firebaseField: 'mcbBox' },
        { id: 'earthingWire', label: 'DUAL GI / COPPER EARTHING WIRE IN MCB BOX', firebaseField: 'earthingWire' }
      ]
    },
    {
      id: 'stairs',
      title: 'STAIRS MARBLE WORK OR FLOOR LEVEL',
      firebaseField: 'stairsWork',
      status: 'Incomplete',
      items: []
    },
    {
      id: 'lift',
      title: 'LIFT SQUARE FOLDING',
      firebaseField: 'liftSquareFolding',
      status: 'Incomplete',
      items: []
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preworking Stage</Text>

      <View style={styles.preworkGrid}>
        {preworkStages.map((stage) => (
          <TouchableOpacity
            key={stage.id}
            style={styles.workStageCard}
            onPress={() => openPreworkModal(stage.id)}
            activeOpacity={0.8}
          >
            <View style={styles.workStageContent}>
              <View style={styles.workStageInfo}>
                <Text style={styles.workStageTitle}>{stage.title}</Text>
                <Text style={[
                  styles.workStageStatus,
                  getStageStatus(stage) === 'Complete' && styles.workStageStatusComplete
                ]}>
                  {getStageStatus(stage)}
                </Text>
              </View>
              <View style={styles.workStageArrow}>
                <Ionicons name="chevron-forward" size={20} color={Colors.dark.icon} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preworking Stage Modal */}
      <Modal
        visible={preworkModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreworkModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.preworkModalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>
                  {preworkStages.find(stage => stage.id === selectedWorkStage)?.title || 'Preworking Stage'}
                </Text>
              </View>
              <TouchableOpacity onPress={closePreworkModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.preworkScrollView}
              contentContainerStyle={styles.preworkScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <View style={styles.preworkStatusContainer}>
                <Text style={styles.preworkStatusLabel}>Status</Text>
                <Text style={[
                  styles.preworkStatusValue,
                  siteData?.[preworkStages.find(stage => stage.id === selectedWorkStage)?.firebaseField || '']?.status === 'Complete' && styles.completeStatusValue
                ]}>
                  {siteData?.[preworkStages.find(stage => stage.id === selectedWorkStage)?.firebaseField || '']?.status || 'Incomplete'}
                </Text>
              </View>

              <View style={styles.checklistContainer}>
                {preworkStages.find(stage => stage.id === selectedWorkStage)?.items.map((item, index) => {
                  const isChecked = checkedItems[selectedWorkStage]?.[item.id];

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.checklistItem}
                      onPress={() => toggleChecklistItem(selectedWorkStage, item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.checkboxContainer}>
                        <Ionicons
                          name={isChecked ? "checkbox" : "square-outline"}
                          size={20}
                          color={isChecked ? Colors.dark.tint : Colors.dark.icon}
                        />
                      </View>
                      <Text style={[
                        styles.checklistText,
                        isChecked && styles.checkedText
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {preworkStages.find(stage => stage.id === selectedWorkStage)?.items.length === 0 && (
                  <View style={styles.emptyChecklist}>
                    <Ionicons name="information-circle" size={24} color={Colors.dark.icon} />
                    <Text style={styles.emptyChecklistText}>No checklist items available for this work stage.</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Fixed Save Button at Bottom */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (isStageComplete(selectedWorkStage) ||
                   getButtonText(selectedWorkStage) === "Mark as Complete") && styles.completeButton
                ]}
                onPress={saveChanges}
                disabled={savingChanges}
                activeOpacity={0.8}
              >
                {savingChanges ? (
                  <View style={styles.buttonContent}>
                    <Ionicons name="sync" size={20} color={Colors.dark.text} />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name={getButtonText(selectedWorkStage) === "Mark as Complete" ? "checkmark-circle" : "save"}
                      size={20}
                      color={Colors.dark.text}
                    />
                      <Text style={styles.saveButtonText}>
                        {getButtonText(selectedWorkStage)}
                      </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
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
  preworkGrid: {
    gap: 12,
  },
  workStageCard: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  workStageContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  workStageInfo: {
    flex: 1,
  },
  workStageTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  workStageStatus: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500' as const,
  },
  workStageStatusComplete: {
    color: '#4CAF50',
  },
  workStageArrow: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  preworkModalContainer: {
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
    flexDirection: 'column' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  modalHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
  },
  preworkScrollView: {
    flex: 1,
  },
  preworkScrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  preworkStatusContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preworkStatusLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  preworkStatusValue: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600' as const,
  },
  completeStatusValue: {
    color: '#4CAF50',
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checklistText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500' as const,
    lineHeight: 20,
    flex: 1,
  },
  checkedText: {
    color: Colors.dark.tint,
    textDecorationLine: 'line-through' as const,
    opacity: 0.7,
  },
  saveButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.background,
  },
  saveButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyChecklist: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
  },
  emptyChecklistText: {
    fontSize: 14,
    color: Colors.dark.icon,
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 20,
  },
};

export default PreworkingStage;
