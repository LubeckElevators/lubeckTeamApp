import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComplaintDetailScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useUser();
  const { complaint: complaintParam } = useLocalSearchParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' | 'audio' } | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [serviceCode, setServiceCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [sendingNotes, setSendingNotes] = useState(false);
  const codeInputRef = React.useRef<TextInput>(null);
  const notesInputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    const fetchComplaintData = async () => {
      if (complaintParam) {
        try {
          const parsedComplaint = JSON.parse(complaintParam as string);

          // Get complaint ID and team member email
          const complaintId = parsedComplaint.complaintId || parsedComplaint.id || parsedComplaint._id;

          if (complaintId && userProfile?.email) {
            try {
              // Fetch the latest complaint data from Firebase to get updated messages
              const complaintRef = doc(db, 'team', userProfile.email, 'complaints', complaintId);
              const complaintDoc = await getDoc(complaintRef);

              if (complaintDoc.exists()) {
                const firebaseData = complaintDoc.data();

                // Merge Firebase data with initial data, prioritizing Firebase messages
                const updatedComplaint = {
                  ...parsedComplaint,
                  ...firebaseData,
                  messages: firebaseData.messages || parsedComplaint.messages || []
                };

                setComplaint(updatedComplaint);
                return;
              }
            } catch (firebaseError) {
              console.error('Error fetching from Firebase:', firebaseError);
            }
          }

          // Fallback to initial data if Firebase fetch fails
          console.log('Using initial complaint data as fallback');
          setComplaint(parsedComplaint);

        } catch (error) {
          console.error('Error parsing complaint data:', error);
          router.back();
        }
      }
    };

    fetchComplaintData();
  }, [complaintParam, userProfile?.email]);

  // Handle modal opening and cursor positioning
  useEffect(() => {
    if (showCompleteModal && !showNotesInput && codeInputRef.current) {
      // Small delay to ensure the input is rendered and ready
      setTimeout(() => {
        if (codeInputRef.current) {
          codeInputRef.current.focus();
          // Ensure cursor is at the end
          codeInputRef.current.setNativeProps({
            selection: { start: serviceCode.length, end: serviceCode.length }
          });
        }
      }, 300);
    } else if (showCompleteModal && showNotesInput && notesInputRef.current) {
      // Focus notes input when notes step is shown
      setTimeout(() => {
        if (notesInputRef.current) {
          notesInputRef.current.focus();
        }
      }, 300);
    }
  }, [showCompleteModal, showNotesInput]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const openMediaModal = (url: string, type: 'image' | 'video' | 'audio') => {
    setSelectedMedia({ url, type });
    setMediaModalVisible(true);
  };

  const closeMediaModal = () => {
    setMediaModalVisible(false);
    setSelectedMedia(null);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const sendNotesAndComplete = async () => {
    if (!completionNotes.trim()) {
      Alert.alert('Error', 'Please enter completion notes');
      return;
    }

    setSendingNotes(true);

    try {
      // Get complaint ID and team member email
      const complaintId = complaint.complaintId || complaint.id || complaint._id;

      if (!complaintId || !userProfile?.email) {
        throw new Error('Missing complaint or user data');
      }

      // Create notes message from team member
      const notesMessage = {
        id: Date.now().toString(),
        message: `Completion Notes: ${completionNotes.trim()}`,
        sender: userProfile.name || 'Team Member',
        timestamp: Timestamp.now(),
        type: 'admin'
      };

      // Create system message
      const systemMessage = {
        id: (Date.now() + 1).toString(),
        message: 'The Complaint Has Been Closed',
        sender: 'System',
        timestamp: Timestamp.now(),
        type: 'system'
      };

      // Get customer email for the customer path
      const customerEmail = complaint.customer?.email || complaint.email;

      if (!customerEmail) {
        throw new Error('Customer email not found');
      }

      // Update status and add messages to all three locations
      const teamComplaintRef = doc(db, 'team', userProfile.email, 'complaints', complaintId);
      const globalComplaintRef = doc(db, 'Complaints', complaintId);
      const customerComplaintRef = doc(db, 'Users', customerEmail, 'Complaints', complaintId);

      await Promise.all([
        updateDoc(teamComplaintRef, {
          status: 'Completed',
          completedAt: Timestamp.now(),
          completedBy: userProfile.name,
          messages: arrayUnion(notesMessage, systemMessage)
        }),
        updateDoc(globalComplaintRef, {
          status: 'Completed',
          completedAt: Timestamp.now(),
          completedBy: userProfile.name,
          messages: arrayUnion(notesMessage, systemMessage)
        }),
        updateDoc(customerComplaintRef, {
          status: 'Completed',
          completedAt: Timestamp.now(),
          completedBy: userProfile.name,
          messages: arrayUnion(notesMessage, systemMessage)
        })
      ]);

      // Update local state
      const updatedComplaint = {
        ...complaint,
        status: 'Completed',
        completedAt: new Date(),
        completedBy: userProfile.name,
        messages: [
          ...(complaint.messages || []),
          { ...notesMessage, timestamp: new Date() },
          { ...systemMessage, timestamp: new Date() }
        ]
      };

      setComplaint(updatedComplaint);
      setShowCompleteModal(false);
      setServiceCode('');
      setCompletionNotes('');
      setShowNotesInput(false);

      Alert.alert(
        'Success',
        'Complaint has been completed with notes!',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error sending notes:', error);
      Alert.alert('Error', 'Failed to send notes. Please try again.');
    } finally {
      setSendingNotes(false);
    }
  };

  const verifyAndCompleteComplaint = async () => {
    if (!serviceCode.trim() || serviceCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit service code');
      return;
    }

    setVerifyingCode(true);

    try {
      // Get complaint ID and team member email
      const complaintId = complaint.complaintId || complaint.id || complaint._id;

      if (!complaintId) {
        throw new Error('Complaint ID not found');
      }

      if (!userProfile?.email) {
        throw new Error('User email not found');
      }

      // Verify the service code by fetching the complaint data to check secretServiceCode
      const complaintRef = doc(db, 'team', userProfile.email, 'complaints', complaintId);
      const complaintDoc = await getDoc(complaintRef);

      if (!complaintDoc.exists()) {
        throw new Error('Complaint not found');
      }

      const complaintData = complaintDoc.data();
      const expectedCode = complaintData.secretServiceCode || complaintData.serviceCode;

      if (!expectedCode) {
        Alert.alert('Error', 'Service code not configured for this complaint');
        return;
      }

      if (serviceCode !== expectedCode.toString()) {
        Alert.alert('Error', 'Invalid service code. Please check with the customer.');
        return;
      }

      // Create verification message
      const newMessage = {
        id: Date.now().toString(),
        message: `Service code verified. Preparing to complete complaint.`,
        sender: userProfile.name || 'Team Member',
        timestamp: Timestamp.now(),
        type: 'admin'
      };

      // Code is valid, update status to "Completed" in both locations
      const teamComplaintRef = doc(db, 'team', userProfile.email, 'complaints', complaintId);
      const globalComplaintRef = doc(db, 'Complaints', complaintId);

      await Promise.all([
        updateDoc(teamComplaintRef, {
          status: 'Completed',
          completedAt: Timestamp.now(),
          completedBy: userProfile.name
        }),
        updateDoc(globalComplaintRef, {
          status: 'Completed',
          completedAt: Timestamp.now(),
          completedBy: userProfile.name
        })
      ]);

      // Show notes input instead of closing modal
      setShowNotesInput(true);
      setVerifyingCode(false);

      // Update local state with verification (but don't close modal yet)
      const updatedComplaint = {
        ...complaint,
        messages: [...(complaint.messages || []), {
          ...newMessage,
          timestamp: new Date()
        }]
      };

      setComplaint(updatedComplaint);

    } catch (error) {
      console.error('Error completing complaint:', error);
      Alert.alert('Error', 'Failed to complete complaint. Please try again.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || sendingMessage) return;

    setSendingMessage(true);

    try {
      // Create new message object for Firestore
      const newMessage = {
        id: Date.now().toString(),
        message: messageInput.trim(),
        sender: userProfile?.name || 'Team Member',
        timestamp: Timestamp.now(),
        type: 'admin'
      };

      // Get complaint ID - try different possible field names
      const complaintId = complaint.complaintId || complaint.id || complaint._id;

      if (!complaintId) {
        console.error('No complaint ID found');
        return;
      }

      // Get team member email for the path
      const teamMemberEmail = complaint.teamMember?.email;

      if (!teamMemberEmail) {
        console.error('No team member email found');
        return;
      }

      // Get customer email for the customer path
      const customerEmail = complaint.customer?.email || complaint.email;

      if (!customerEmail) {
        console.error('No customer email found');
        return;
      }

      // Create Firestore document references for all three locations
      const teamComplaintRef = doc(db, 'team', teamMemberEmail, 'complaints', complaintId);
      const globalComplaintRef = doc(db, 'Complaints', complaintId);
      const customerComplaintRef = doc(db, 'Users', customerEmail, 'Complaints', complaintId);

      // Update all three documents by adding the new message to the messages array
      await Promise.all([
        updateDoc(teamComplaintRef, {
          messages: arrayUnion(newMessage)
        }),
        updateDoc(globalComplaintRef, {
          messages: arrayUnion(newMessage)
        }),
        updateDoc(customerComplaintRef, {
          messages: arrayUnion(newMessage)
        })
      ]);

      // Update local complaint state immediately for better UX
      const updatedComplaint = {
        ...complaint,
        messages: [...(complaint.messages || []), {
          ...newMessage,
          timestamp: new Date() // Convert Timestamp to Date for local display
        }]
      };

      setComplaint(updatedComplaint);
      setMessageInput('');

      // Dismiss keyboard after sending
      Keyboard.dismiss();

      // Optional: Could add a refresh mechanism here if needed
      console.log('Message sent successfully:', newMessage);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };


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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      marginRight: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
      marginLeft: -8,
    },
    urgencyBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
      minWidth: 60,
      alignItems: 'center',
    },
    urgencyText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    scrollContent: {
      paddingBottom: 100, // Extra padding for the bottom button
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
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    priorityText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
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
    photoContainer: {
      marginRight: 8,
      position: 'relative',
    },
    photoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    videoLink: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].tint,
      marginBottom: 4,
      textDecorationLine: 'underline',
    },
    videoContainer: {
      marginBottom: 8,
      padding: 12,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    videoThumbnail: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    videoText: {
      fontSize: 14,
      fontWeight: '500',
      color: Colors[colorScheme ?? 'dark'].text,
      marginLeft: 8,
    },
    playButton: {
      marginLeft: 12,
    },
    audioContainer: {
      marginBottom: 8,
      padding: 12,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    audioPlayer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    audioText: {
      fontSize: 14,
      fontWeight: '500',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
      marginLeft: 8,
    },
    audioIcon: {
      marginLeft: 4,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: SCREEN_WIDTH * 0.9,
      maxHeight: '90%',
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    modalCloseButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    imageModalContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalImage: {
      width: '100%',
      height: 300,
      borderRadius: 12,
      alignSelf: 'center',
    },
    videoModalContainer: {
      alignItems: 'center',
      padding: 20,
    },
    videoInfo: {
      alignItems: 'center',
      marginBottom: 30,
    },
    videoModalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 10,
      marginBottom: 5,
    },
    videoModalUrl: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
    },
    audioModalContainer: {
      alignItems: 'center',
      padding: 20,
    },
    audioInfo: {
      alignItems: 'center',
      marginBottom: 30,
    },
    audioModalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 10,
      marginBottom: 5,
    },
    audioModalUrl: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
    },
    playVideoButton: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    playAudioButton: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    playButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 8,
    },
    // Message Input styles
    messageInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginTop: 16,
      marginBottom: 16,
    },
    messageInputContainer: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
    },
    messageInput: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      backgroundColor: 'transparent',
      maxHeight: 80,
      minHeight: 36,
      textAlignVertical: 'top',
    },
    messageInputFocused: {
      borderColor: Colors[colorScheme ?? 'dark'].tint,
    },
    sendButton: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    // Google Maps styles
    mapContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
    },
    mapMockup: {
      width: '100%',
      height: 200,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    mapBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#E8F4F8', // Light blue background like maps
    },
    mapGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column',
      justifyContent: 'space-around',
    },
    mapGridVertical: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    gridLine: {
      height: 1,
      backgroundColor: '#B0BEC5',
      opacity: 0.4,
    },
    gridLineVertical: {
      width: 1,
      backgroundColor: '#B0BEC5',
      opacity: 0.4,
    },
    mapFeatures: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    buildingBlock: {
      position: 'absolute',
      backgroundColor: '#90CAF9',
      opacity: 0.6,
      top: 20,
      left: 20,
      width: 35,
      height: 25,
      borderRadius: 2,
    },
    locationPin: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -12 }, { translateY: -24 }],
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    addressLabel: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    addressLabelText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    mapInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme ?? 'dark'].border,
    },
    mapInfoText: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      marginLeft: 6,
      fontStyle: 'italic',
    },
    openInMapsButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    openInMapsText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    locationInfo: {
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    locationText: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      lineHeight: 20,
    },
    // Media styles
    mediaContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    mediaPlaceholder: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
    mediaPlaceholderText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 8,
      marginBottom: 4,
    },
    mediaUrlText: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
    },
    openMediaButton: {
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    openMediaButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    // Mark Complete Button styles
    markCompleteButton: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      width: '90%',
      alignSelf: 'center',
      marginLeft: '5%',
      marginRight: '5%',
      backgroundColor: Colors[colorScheme ?? 'dark'].tint,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      zIndex: 1000,
    },
    markCompleteText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    // Service Code Modal styles
    serviceCodeModal: {
      width: SCREEN_WIDTH * 0.9,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      maxHeight: '80%',
      minHeight: 400,
    },
    serviceCodeScrollView: {
      flex: 1,
    },
    serviceCodeContent: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
      minHeight: 350,
      justifyContent: 'center',
    },
    serviceCodeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    serviceCodeSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    serviceCodeInput: {
      width: 200,
      height: 60,
      borderWidth: 2,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      textAlign: 'center',
      letterSpacing: 8,
      marginBottom: 24,
    },
    notesInput: {
      width: '100%',
      height: 100,
      borderWidth: 2,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].text,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 24,
      textAlignVertical: 'top',
    },
    verifyButton: {
      backgroundColor: '#4CAF50', // Green for completion
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#4CAF50',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: 16,
    },
    verifyButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 2,
    },
    verifyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    serviceCodeNote: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
      lineHeight: 16,
      opacity: 0.8,
    },
  });

  if (!complaint) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 20}
      enabled={keyboardVisible}
    >
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'dark'].text} />
          </TouchableOpacity>
          <Text style={styles.title}>Complaint Details</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: getPriorityColor(complaint.urgency || complaint.priority) }]}>
          <Text style={styles.urgencyText}>{complaint.urgency || complaint.priority || 'Medium'}</Text>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && { paddingBottom: keyboardHeight + 100 }
          ]}
        >
        {/* Basic Information */}
        <View style={styles.detailSection}>
          <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Basic Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title:</Text>
            <Text style={styles.detailValue}>
              {complaint.title || complaint.issueType || 'Untitled Complaint'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>
              {complaint.description || 'No description available'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>
              {complaint.status || 'Unknown'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {typeof complaint.createdAt === 'string' ? complaint.createdAt : (complaint.createdAt?.toDate?.()?.toLocaleString() || 'Unknown')}
            </Text>
          </View>

          {complaint.updatedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Updated:</Text>
              <Text style={styles.detailValue}>
                {typeof complaint.updatedAt === 'string' ? complaint.updatedAt : (complaint.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown')}
              </Text>
            </View>
          )}
        </View>

        {/* Customer Information */}
        {complaint.customer && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Customer Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>
                {complaint.customer.fullName || complaint.fullName || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>
                {complaint.customer.email || complaint.email || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>
                {complaint.customer.phone || complaint.phone || 'Unknown'}
              </Text>
            </View>

            {complaint.customer.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {complaint.customer.address.flatNumber || ''} {complaint.customer.address.addressLine1 || ''}, {complaint.customer.address.city || ''}, {complaint.customer.address.state || ''} {complaint.customer.address.pincode || ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Lift Information */}
        {complaint.lift && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Lift Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lift ID:</Text>
              <Text style={styles.detailValue}>
                {complaint.lift.liftId || complaint.liftId || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lift Name:</Text>
              <Text style={styles.detailValue}>
                {complaint.lift.liftName || 'Unknown'}
              </Text>
            </View>

            {complaint.lift.liftImage && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lift Image:</Text>
                <Image
                  source={{ uri: complaint.lift.liftImage }}
                  style={styles.liftImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {complaint.lift.amcDetails && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>AMC Type:</Text>
                  <Text style={styles.detailValue}>
                    {complaint.lift.amcDetails.amcType || 'Unknown'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>AMC Provider:</Text>
                  <Text style={styles.detailValue}>
                    {complaint.lift.amcDetails.provider || 'Unknown'}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Location Information */}
        {complaint.location && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Location Information</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Building:</Text>
              <Text style={styles.detailValue}>
                {complaint.location.buildingName || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>
                {complaint.location.address || 'Unknown'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Floor Range:</Text>
              <Text style={styles.detailValue}>
                {complaint.location.floorRange || 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {/* Google Maps Section */}
        {complaint.customer?.address ? (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Location</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                {complaint.customer.address.addressLine1 && `${complaint.customer.address.addressLine1}, `}
                {complaint.customer.address.addressLine2 && `${complaint.customer.address.addressLine2}, `}
                {complaint.customer.address.city && `${complaint.customer.address.city}, `}
                {complaint.customer.address.state && `${complaint.customer.address.state} `}
                {complaint.customer.address.pincode && `${complaint.customer.address.pincode}`}
              </Text>
            </View>
            <View style={styles.mapContainer}>
              {/* Map Mockup */}
              <View style={styles.mapMockup}>
                {/* Background gradient */}
                <View style={styles.mapBackground}>
                  <View style={styles.mapGrid}>
                    {/* Horizontal grid lines */}
                    <View style={styles.gridLine} />
                    <View style={styles.gridLine} />
                    <View style={styles.gridLine} />
                    <View style={styles.gridLine} />
                    <View style={styles.gridLine} />
                  </View>
                  <View style={styles.mapGridVertical}>
                    {/* Vertical grid lines */}
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                    <View style={styles.gridLineVertical} />
                  </View>

                  {/* Location areas (roads/buildings) */}
                  <View style={styles.mapFeatures}>
                    <View style={styles.buildingBlock} />
                    <View style={[styles.buildingBlock, { top: 40, left: 60, width: 30, height: 20 }]} />
                    <View style={[styles.buildingBlock, { top: 80, right: 40, width: 25, height: 35 }]} />
                    <View style={[styles.buildingBlock, { bottom: 50, left: 80, width: 20, height: 30 }]} />
                  </View>
                </View>

                {/* Location Pin */}
                <View style={styles.locationPin}>
                  <Ionicons name="location" size={24} color="#FF4444" />
                </View>

                {/* Address Label */}
                <View style={styles.addressLabel}>
                  <Text style={styles.addressLabelText}>
                    {[complaint.customer.address.city, complaint.customer.address.state].filter(Boolean).join(', ') || 'Location'}
                  </Text>
                </View>
              </View>

              {/* Map Info */}
              <View style={styles.mapInfo}>
                <Ionicons name="information-circle" size={16} color={Colors[colorScheme ?? 'dark'].icon} />
                <Text style={styles.mapInfoText}>
                  Tap button below to open in Google Maps
                </Text>
              </View>

              <TouchableOpacity
                style={styles.openInMapsButton}
                onPress={() => {
                  const address = [
                    complaint.customer.address.addressLine1,
                    complaint.customer.address.addressLine2,
                    complaint.customer.address.city,
                    complaint.customer.address.state,
                    complaint.customer.address.pincode
                  ].filter(Boolean).join(', ');
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                  Linking.openURL(mapsUrl);
                }}
              >
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={styles.openInMapsText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Location</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                No address information available for this complaint.
              </Text>
            </View>
          </View>
        )}

        {/* Attachments */}
        {((complaint.photos && complaint.photos.length > 0) ||
          (complaint.videos && complaint.videos.length > 0) ||
          complaint.voiceMessage ||
          (complaint.attachments && (
            (complaint.attachments.photos && complaint.attachments.photos.length > 0) ||
            (complaint.attachments.videos && complaint.attachments.videos.length > 0) ||
            complaint.attachments.voiceMessage
          ))) && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Attachments</Text>

            {/* Photos */}
            {(complaint.photos && complaint.photos.length > 0) ||
             (complaint.attachments?.photos && complaint.attachments.photos.length > 0) ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>
                  Photos ({(complaint.photos || complaint.attachments?.photos || []).length}):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {(complaint.photos || complaint.attachments?.photos || []).map((photo: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openMediaModal(photo, 'image')}
                      style={styles.photoContainer}
                    >
                      <Image
                        source={{ uri: photo }}
                        style={styles.attachmentImage}
                        resizeMode="cover"
                      />
                      <View style={styles.photoOverlay}>
                        <Ionicons name="eye" size={16} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Videos */}
            {(complaint.videos && complaint.videos.length > 0) ||
             (complaint.attachments?.videos && complaint.attachments.videos.length > 0) ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>
                  Videos ({(complaint.videos || complaint.attachments?.videos || []).length}):
                </Text>
                {(complaint.videos || complaint.attachments?.videos || []).map((video: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openMediaModal(video, 'video')}
                    style={styles.videoContainer}
                  >
                    <View style={styles.videoThumbnail}>
                      <Ionicons name="videocam" size={24} color={Colors[colorScheme ?? 'dark'].text} />
                      <Text style={styles.videoText}>Video {index + 1}</Text>
                    </View>
                    <View style={styles.playButton}>
                      <Ionicons name="play-circle" size={32} color={Colors[colorScheme ?? 'dark'].tint} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Voice Message */}
            {complaint.voiceMessage || complaint.attachments?.voiceMessage ? (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>Voice Message:</Text>
                <TouchableOpacity
                  onPress={() => openMediaModal(complaint.voiceMessage || complaint.attachments?.voiceMessage || '', 'audio')}
                  style={styles.audioContainer}
                >
                  <View style={styles.audioPlayer}>
                    <View style={styles.videoThumbnail}>
                      <Ionicons name="musical-notes" size={20} color={Colors[colorScheme ?? 'dark'].tint} />
                      <Text style={styles.audioText}>Voice Message</Text>
                    </View>
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name="play-circle" size={24} color={Colors[colorScheme ?? 'dark'].tint} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        {/* Messages */}
        {complaint.messages && complaint.messages.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>
              Messages ({complaint.messages.length})
            </Text>

            {complaint.messages.map((message: any, index: number) => (
              <View key={message.id || index} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageSender}>
                    {message.sender || 'Unknown'}
                  </Text>
                  <Text style={styles.messageTime}>
                    {typeof message.timestamp === 'string'
                      ? message.timestamp
                      : (message.timestamp?.toDate?.()?.toLocaleString() || message.timestamp?.toLocaleString() || 'Unknown time')
                    }
                  </Text>
                </View>
                <Text style={styles.messageText}>
                  {message.message || 'No message content'}
                </Text>
              </View>
            ))}

            {/* Message Input */}
            <View style={styles.messageInputRow}>
              <View style={[
                styles.messageInputContainer,
                isInputFocused && styles.messageInputFocused
              ]}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type your message..."
                  placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                  value={messageInput}
                  onChangeText={setMessageInput}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  multiline
                  maxLength={500}
                  editable={!sendingMessage}
                  selectionColor={Colors[colorScheme ?? 'dark'].tint}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageInput.trim() || sendingMessage) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!messageInput.trim() || sendingMessage}
                activeOpacity={0.7}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Floating Mark Complete Button - Only show if not completed */}
      {complaint.status !== 'Completed' && (
        <TouchableOpacity
          style={styles.markCompleteButton}
          onPress={() => setShowCompleteModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.markCompleteText}>Mark Complete</Text>
        </TouchableOpacity>
      )}

      {/* Media Modal */}
      <Modal
        visible={mediaModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeMediaModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeMediaModal}>
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'dark'].text} />
            </TouchableOpacity>

            {selectedMedia?.type === 'image' && (
              <View style={styles.imageModalContainer}>
                <Image
                  source={{ uri: selectedMedia.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {selectedMedia?.type === 'video' && (
              <View style={styles.mediaContainer}>
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="videocam" size={48} color={Colors[colorScheme ?? 'dark'].tint} />
                  <Text style={styles.mediaPlaceholderText}>Video Content</Text>
                  <Text style={styles.mediaUrlText}>{selectedMedia.url.substring(0, 40)}...</Text>
                </View>
                <TouchableOpacity
                  style={styles.openMediaButton}
                  onPress={() => {
                    closeMediaModal();
                    Linking.openURL(selectedMedia.url);
                  }}
                >
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.openMediaButtonText}>Open Video</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedMedia?.type === 'audio' && (
              <View style={styles.mediaContainer}>
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="musical-notes" size={48} color={Colors[colorScheme ?? 'dark'].tint} />
                  <Text style={styles.mediaPlaceholderText}>Voice Message</Text>
                  <Text style={styles.mediaUrlText}>{selectedMedia.url.substring(0, 40)}...</Text>
                </View>
                <TouchableOpacity
                  style={styles.openMediaButton}
                  onPress={() => {
                    closeMediaModal();
                    Linking.openURL(selectedMedia.url);
                  }}
                >
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.openMediaButtonText}>Play Audio</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Secret Service Code Modal */}
      <Modal
        visible={showCompleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowCompleteModal(false);
          setServiceCode('');
          setCompletionNotes('');
          setShowNotesInput(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={styles.serviceCodeModal}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCompleteModal(false);
                setServiceCode('');
                setCompletionNotes('');
                setShowNotesInput(false);
              }}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'dark'].text} />
            </TouchableOpacity>

            <ScrollView
              style={styles.serviceCodeScrollView}
              contentContainerStyle={styles.serviceCodeContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {!showNotesInput ? (
                // Code verification step
                <>
                  <Ionicons name="shield-checkmark" size={48} color={Colors[colorScheme ?? 'dark'].tint} />
                  <Text style={styles.serviceCodeTitle}>Enter Secret Service Code</Text>
                  <Text style={styles.serviceCodeSubtitle}>
                    Ask this 6-digit code from the customer to verify completion
                  </Text>

                  <TextInput
                    ref={codeInputRef}
                    style={styles.serviceCodeInput}
                    placeholder="000000"
                    placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                    value={serviceCode}
                    onChangeText={(text) => {
                      // Only allow digits and limit to 6 characters
                      const cleanedText = text.replace(/[^0-9]/g, '');
                      if (cleanedText.length <= 6) {
                        setServiceCode(cleanedText);
                      }
                    }}
                    onFocus={() => {
                      // Ensure cursor is positioned correctly when focused
                      setTimeout(() => {
                        if (codeInputRef.current) {
                          // Force cursor to end position to ensure it's visible
                          codeInputRef.current.setNativeProps({
                            selection: { start: serviceCode.length, end: serviceCode.length }
                          });
                        }
                      }, 100);
                    }}
                    keyboardType="numeric"
                    maxLength={6}
                    selectionColor={Colors[colorScheme ?? 'dark'].tint}
                    selection={{ start: serviceCode.length, end: serviceCode.length }}
                    autoFocus={true}
                    textAlign="center"
                    selectTextOnFocus={false}
                  />

                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      (!serviceCode.trim() || serviceCode.length !== 6 || verifyingCode) && styles.verifyButtonDisabled
                    ]}
                    onPress={verifyAndCompleteComplaint}
                    disabled={!serviceCode.trim() || serviceCode.length !== 6 || verifyingCode}
                  >
                    {verifyingCode ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.verifyButtonText}>Verify & Complete</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.serviceCodeNote}>
                    This code ensures the customer has verified the service completion.
                  </Text>
                </>
              ) : (
                // Notes input step
                <>
                  <Ionicons name="document-text" size={48} color={Colors[colorScheme ?? 'dark'].tint} />
                  <Text style={styles.serviceCodeTitle}>Add Completion Notes</Text>
                  <Text style={styles.serviceCodeSubtitle}>
                    Add any additional notes about the service completion
                  </Text>

                  <TextInput
                    ref={notesInputRef}
                    style={styles.notesInput}
                    placeholder="Enter completion notes..."
                    placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
                    value={completionNotes}
                    onChangeText={setCompletionNotes}
                    multiline
                    maxLength={500}
                    selectionColor={Colors[colorScheme ?? 'dark'].tint}
                    autoFocus={true}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      (!completionNotes.trim() || sendingNotes) && styles.verifyButtonDisabled
                    ]}
                    onPress={sendNotesAndComplete}
                    disabled={!completionNotes.trim() || sendingNotes}
                  >
                    {sendingNotes ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                        <Text style={styles.verifyButtonText}>Send Notes & Complete</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.serviceCodeNote}>
                    These notes will be sent as a message and the complaint will be closed.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
}
