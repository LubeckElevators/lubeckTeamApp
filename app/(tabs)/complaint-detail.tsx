import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComplaintDetailScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { complaint: complaintParam } = useLocalSearchParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' | 'audio' } | null>(null);

  useEffect(() => {
    if (complaintParam) {
      try {
        const parsedComplaint = JSON.parse(complaintParam as string);
        console.log('Complaint data:', parsedComplaint);
        console.log('Attachments check:', {
          photos: parsedComplaint.photos,
          videos: parsedComplaint.videos,
          voiceMessage: parsedComplaint.voiceMessage,
          hasAnyAttachments: !!(parsedComplaint.photos || parsedComplaint.videos || parsedComplaint.voiceMessage)
        });
        setComplaint(parsedComplaint);
      } catch (error) {
        console.error('Error parsing complaint data:', error);
        router.back();
      }
    }
  }, [complaintParam]);

  const openMediaModal = (url: string, type: 'image' | 'video' | 'audio') => {
    setSelectedMedia({ url, type });
    setMediaModalVisible(true);
  };

  const closeMediaModal = () => {
    setMediaModalVisible(false);
    setSelectedMedia(null);
  };


  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency?.toLowerCase()) {
      case 'critical': return '#F44336';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return Colors[colorScheme ?? 'dark'].icon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return '#F44336';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
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
    // WebView styles
    webviewContainer: {
      width: '100%',
      height: 400,
      borderRadius: 12,
      overflow: 'hidden',
    },
    webview: {
      flex: 1,
      borderRadius: 12,
    },
    webviewLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
    },
    webviewLoadingText: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].text,
      marginTop: 10,
      fontWeight: '500',
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    {typeof message.timestamp === 'string' ? message.timestamp : (message.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time')}
                  </Text>
                </View>
                <Text style={styles.messageText}>
                  {message.message || 'No message content'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Attachments */}
        {(complaint.photos || complaint.videos || complaint.voiceMessage) && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Attachments</Text>

            {complaint.photos && complaint.photos.length > 0 && (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>
                  Photos ({complaint.photos.length}):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {complaint.photos.map((photo: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {complaint.videos && complaint.videos.length > 0 && (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>
                  Videos ({complaint.videos.length}):
                </Text>
                {complaint.videos.map((video: string, index: number) => (
                  <Text key={index} style={styles.videoLink}>
                    Video {index + 1}: {video.substring(0, 50)}...
                  </Text>
                ))}
              </View>
            )}

            {complaint.voiceMessage && (
              <View style={styles.attachmentSection}>
                <Text style={styles.attachmentTitle}>Voice Message:</Text>
                <Text style={styles.videoLink}>
                  {complaint.voiceMessage.substring(0, 50)}...
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

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
              <View style={styles.webviewContainer}>
                <WebView
                  source={{ uri: selectedMedia.url }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  renderLoading={() => (
                    <View style={styles.webviewLoading}>
                      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
                      <Text style={styles.webviewLoadingText}>Loading video...</Text>
                    </View>
                  )}
                />
              </View>
            )}

            {selectedMedia?.type === 'audio' && (
              <View style={styles.webviewContainer}>
                <WebView
                  source={{ uri: selectedMedia.url }}
                  style={styles.webview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  renderLoading={() => (
                    <View style={styles.webviewLoading}>
                      <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
                      <Text style={styles.webviewLoadingText}>Loading audio...</Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}
