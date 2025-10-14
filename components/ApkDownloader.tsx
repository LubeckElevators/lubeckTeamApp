import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ApkDownloaderProps {
  apkUrl: string;
  version: string;
  onComplete: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export default function ApkDownloader({
  apkUrl,
  version,
  onComplete,
  onCancel,
  theme = 'dark'
}: ApkDownloaderProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect if running in Expo Go
  const isRunningInExpoGo = (): boolean => {
    try {
      return (global as any).Expo?.constants?.appOwnership === 'expo';
    } catch {
      return false;
    }
  };

  const startDownload = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);
      setDownloadProgress(0);

      // Create download directory
      const downloadDir = FileSystem.documentDirectory! + 'downloads/';
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

      // Generate filename
      const fileName = `lubeck-elevators-${version}.apk`;
      const fileUri = downloadDir + fileName;

      // Delete existing file if it exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }

      // Start resumable download
      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        fileUri,
        {},
        (progress) => {
          const progressPercent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(progressPercent);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        setDownloadedUri(result.uri);
        setDownloadComplete(true);
        setIsDownloading(false);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download update. Please check your internet connection and try again.');
      setIsDownloading(false);
    }
  }, [apkUrl, version]);

  const installApk = async () => {
    if (!downloadedUri) return;

    try {
      setIsInstalling(true);
      setError(null);

      if (isRunningInExpoGo()) {
        Alert.alert(
          'Expo Go Limitation',
          'APK installation is not supported in Expo Go. Please build a standalone APK to test this feature.',
          [{ text: 'OK', onPress: onComplete }]
        );
        return;
      }

      // Move file to a more accessible location for installation
      const accessiblePath = FileSystem.documentDirectory! + 'update.apk';
      await FileSystem.moveAsync({
        from: downloadedUri,
        to: accessiblePath
      });

      // Get content URI for Android
      const contentUri = await FileSystem.getContentUriAsync(accessiblePath);

      try {
        // Try using IntentLauncher for installation
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/vnd.android.package-archive',
        });
      } catch (intentError) {
        console.warn('IntentLauncher failed, trying Linking.openURL:', intentError);
        // Fallback to Linking.openURL
        await Linking.openURL(contentUri);
      }

      // If we reach here, the installation intent was launched successfully
      Alert.alert(
        'Installation Started',
        'The APK installation has been initiated. Please complete the installation process.',
        [{ text: 'OK', onPress: onComplete }]
      );

    } catch (error) {
      console.error('Installation error:', error);
      setError('Failed to start APK installation. Please try again or install manually.');
      setIsInstalling(false);
    }
  };

  const handleCancel = () => {
    if (isDownloading) {
      // Note: Expo File System doesn't provide a direct way to cancel downloads
      // In a production app, you might want to implement resumable downloads with pause/resume
      Alert.alert(
        'Cancel Download',
        'Are you sure you want to cancel the download?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: onCancel }
        ]
      );
    } else {
      onCancel();
    }
  };

  const handleRetry = () => {
    setError(null);
    setDownloadComplete(false);
    setDownloadedUri(null);
    setDownloadProgress(0);
    startDownload();
  };

  // Auto-start download when component mounts
  useEffect(() => {
    startDownload();
  }, [startDownload]);

  const getProgressPercentage = () => Math.round(downloadProgress * 100);

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.downloadModal, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.iconContainer, { backgroundColor: downloadComplete ? '#4CAF50' : Colors[theme].tint + '20' }]}>
              <Ionicons
                name={downloadComplete ? "checkmark-circle" : "cloud-download"}
                size={24}
                color={downloadComplete ? "#FFFFFF" : Colors[theme].tint}
              />
            </View>
            <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>
              {downloadComplete ? 'Download Complete' : 'Downloading Update'}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {!downloadComplete ? (
              <>
                <Text style={[styles.statusText, { color: Colors[theme].icon }]}>
                  Version {version}
                </Text>

                {/* Progress Bar */}
                <View style={[styles.progressContainer, { backgroundColor: Colors[theme].background }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${downloadProgress * 100}%`,
                        backgroundColor: Colors[theme].tint
                      }
                    ]}
                  />
                </View>

                <Text style={[styles.progressText, { color: Colors[theme].text }]}>
                  {getProgressPercentage()}% downloaded
                </Text>

                {error && (
                  <Text style={[styles.errorText, { color: '#F44336' }]}>
                    {error}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.successText, { color: Colors[theme].text }]}>
                  Version {version} downloaded successfully.
                </Text>
                <Text style={[styles.installText, { color: Colors[theme].icon }]}>
                  Ready to install?
                </Text>

                {isRunningInExpoGo() && (
                  <Text style={[styles.expoGoText, { color: '#FF9800' }]}>
                    ⚠️ APK installation not supported in Expo Go
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton, { borderColor: Colors[theme].border }]}
                onPress={handleCancel}
                disabled={isInstalling}
              >
              <Text style={[styles.cancelButtonText, { color: Colors[theme].icon }]}>
                {isDownloading ? 'Cancel' : 'Later'}
              </Text>
            </Pressable>

            {downloadComplete ? (
              <Pressable
                style={[styles.button, styles.installButton, {
                  backgroundColor: isRunningInExpoGo() ? '#757575' : '#4CAF50'
                }]}
                onPress={isRunningInExpoGo() ? () => Alert.alert('Info', 'Please build a standalone APK to test installation.') : installApk}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="sync" size={16} color="#FFFFFF" />
                    <Text style={styles.installButtonText}>Installing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="construct" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.installButtonText}>
                      {isRunningInExpoGo() ? 'Test Mode' : 'Install Now'}
                    </Text>
                  </View>
                )}
              </Pressable>
            ) : error ? (
              <Pressable
                style={[styles.button, styles.retryButton, { backgroundColor: Colors[theme].tint }]}
                onPress={handleRetry}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            ) : (
              <View style={[styles.button, styles.downloadingButton, { backgroundColor: Colors[theme].tint }]}>
                <Ionicons name="sync" size={16} color="#FFFFFF" />
                <Text style={styles.downloadingButtonText}>Downloading Update...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
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
  downloadModal: {
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
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  installText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  expoGoText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
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
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  installButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  installButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadingButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  downloadingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
});
