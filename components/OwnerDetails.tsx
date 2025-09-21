import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface OwnerDetailsProps {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAadharUrl?: string;
  ownerPanUrl?: string;
  ownerPhotoUrl?: string;
}

const OwnerDetails: React.FC<OwnerDetailsProps> = ({
  ownerName,
  ownerPhone,
  ownerEmail,
  ownerAadharUrl,
  ownerPanUrl,
  ownerPhotoUrl,
}) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

  const handleCall = () => {
    Linking.openURL(`tel:${ownerPhone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${ownerEmail}`);
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
    <View style={styles.container}>
      <Text style={styles.title}>Owner Details</Text>

      <View style={styles.detailsContainer}>
        {/* Name */}
        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={20} color={Colors.dark.icon} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{ownerName}</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="call" size={20} color={Colors.dark.icon} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Phone:</Text>
            <TouchableOpacity onPress={handleCall} style={styles.contactButton}>
              <Text style={styles.contactText}>{ownerPhone}</Text>
              <Ionicons name="call" size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Email */}
        <View style={styles.detailRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={20} color={Colors.dark.icon} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Email:</Text>
            <TouchableOpacity onPress={handleEmail} style={styles.contactButton}>
              <Text style={styles.contactText}>{ownerEmail}</Text>
              <Ionicons name="mail" size={16} color={Colors.dark.tint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Aadhaar */}
        {ownerAadharUrl && (
          <View style={styles.imageFieldContainer}>
            <Text style={styles.imageLabel}>Aadhaar Document</Text>
            <TouchableOpacity
              onPress={() => openImageModal(ownerAadharUrl, 'Aadhaar Document')}
              style={styles.imagePreviewContainer}
              activeOpacity={0.8}
            >
              <Image source={{ uri: ownerAadharUrl }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayContent}>
                  <View style={styles.imageOverlayIcon}>
                    <Ionicons name="eye" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.imageOverlayText}>Tap to view</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* PAN */}
        {ownerPanUrl && (
          <View style={styles.imageFieldContainer}>
            <Text style={styles.imageLabel}>PAN Document</Text>
            <TouchableOpacity
              onPress={() => openImageModal(ownerPanUrl, 'PAN Document')}
              style={styles.imagePreviewContainer}
              activeOpacity={0.8}
            >
              <Image source={{ uri: ownerPanUrl }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayContent}>
                  <View style={styles.imageOverlayIcon}>
                    <Ionicons name="document" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.imageOverlayText}>Tap to view</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Passport Size Photo */}
        {ownerPhotoUrl && (
          <View style={styles.imageFieldContainer}>
            <Text style={styles.imageLabel}>Passport Size Photo</Text>
            <TouchableOpacity
              onPress={() => openImageModal(ownerPhotoUrl, 'Passport Size Photo')}
              style={styles.imagePreviewContainer}
              activeOpacity={0.8}
            >
              <Image source={{ uri: ownerPhotoUrl }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayContent}>
                  <View style={styles.imageOverlayIcon}>
                    <Ionicons name="camera" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.imageOverlayText}>Tap to view</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
              <Text style={styles.modalTitle}>{selectedImageTitle}</Text>
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
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.icon,
    textTransform: 'uppercase' as const,
    fontWeight: 600 as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: 500 as const,
  },
  contactButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500' as const,
    textDecorationLine: 'underline' as const,
  },
  imageFieldContainer: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    width: 100,
    height: 75,
    borderRadius: 12,
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
  imagePreview: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 12,
    padding: 8,
  },
  imageOverlayContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  imageOverlayIcon: {
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    textTransform: 'uppercase' as const,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
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
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.dark.text,
    flex: 1,
    textAlign: 'center' as const,
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

export default OwnerDetails;
