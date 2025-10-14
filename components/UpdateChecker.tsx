import { Colors } from '@/constants/Colors';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ApkDownloader from './ApkDownloader';

interface UpdateInfo {
  version: string;
  url: string;
}

interface UpdateCheckerProps {
  currentVersion: string;
  theme?: 'light' | 'dark';
}

export default function UpdateChecker({ currentVersion, theme = 'dark' }: UpdateCheckerProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDownloader, setShowDownloader] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadInitiated, setDownloadInitiated] = useState(false);

  const checkForUpdates = useCallback(async () => {
    try {
      const updateDocRef = doc(db, 'updates', 'client');
      const docSnap = await getDoc(updateDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UpdateInfo;
        if (data.version && data.version !== currentVersion) {
          setUpdateInfo(data);
          setShowUpdateDialog(true);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [currentVersion]);

  // Check for updates when component mounts
  useEffect(() => {
    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  const handleDownloadUpdate = () => {
    setDownloadInitiated(true);
    setShowUpdateDialog(false);
    setShowDownloader(true);
  };

  const handleLater = () => {
    setShowUpdateDialog(false);
    // Could add logic to remind later
  };

  const handleDownloadComplete = () => {
    setShowDownloader(false);
    setUpdateInfo(null);
  };

  const handleDownloadCancel = () => {
    setShowDownloader(false);
  };

  // Don't render anything if no update is available
  if (!showUpdateDialog && !showDownloader) {
    return null;
  }

  return (
    <>
      {/* Update Available Modal */}
      <Modal
        visible={showUpdateDialog}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowUpdateDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.updateModal, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.iconContainer, { backgroundColor: Colors[theme].tint + '20' }]}>
                <Ionicons name="cloud-download" size={24} color={Colors[theme].tint} />
              </View>
              <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>
                Update Available
              </Text>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={[styles.updateMessage, { color: Colors[theme].text }]}>
                A new version ({updateInfo?.version}) is available.
              </Text>
              <Text style={[styles.currentVersionText, { color: Colors[theme].icon }]}>
                Your current version is {currentVersion}.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.laterButton, { borderColor: Colors[theme].border }]}
                onPress={handleLater}
              >
                <Text style={[styles.laterButtonText, { color: Colors[theme].icon }]}>
                  Later
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.downloadButton,
                  {
                    backgroundColor: downloadInitiated ? '#757575' : Colors[theme].tint,
                    opacity: downloadInitiated ? 0.6 : 1
                  }
                ]}
                onPress={handleDownloadUpdate}
                disabled={downloadInitiated}
              >
                <Ionicons
                  name={downloadInitiated ? "sync" : "download"}
                  size={16}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.downloadButtonText}>
                  {downloadInitiated ? "Starting..." : "Install"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* APK Downloader Modal */}
      {showDownloader && updateInfo && (
        <ApkDownloader
          apkUrl={updateInfo.url}
          version={updateInfo.version}
          onComplete={handleDownloadComplete}
          onCancel={handleDownloadCancel}
          theme={theme}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  updateModal: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 24,
  },
  updateMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  currentVersionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  laterButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 6,
  },
});
