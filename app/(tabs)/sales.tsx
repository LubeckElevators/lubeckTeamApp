import DashboardNav from '@/components/DashboardNav';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SaleData {
  saleId: string;
  customerName: string;
  phoneNumber: string;
  address: {
    line1: string;
    line2?: string;
    line3?: string;
    city: string;
    state: string;
    pincode: string;
  };
  siteRequirement: string;
  note?: string;
  createdAt: string;
  createdBy: string;
}

export default function SalesScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useUser();

  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const profileData = {
    aadhar: "5788 6888 9201",
    email: "raghav.sachdeveloper@gmail.com",
    name: "Raghav Sachdev",
    phone: "8178648498",
    profilepic: "https://media.licdn.com/dms/image/v2/D4D03AQEi1foHXK-r_w/profile-displayphoto-shrink_400_400/B4DZbzs07LGYAk-/0/1747845337681?e=1759363200&v=beta&t=kyEJJZPUJR6XlMw4mPpJa-q6zkI7tM0RW_QdmKKCORI",
    role: "electrical_contractor"
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const fetchSales = useCallback(async () => {
    if (!userProfile?.email) {
      setLoading(false);
      return;
    }

    try {
      const salesQuery = query(
        collection(db, 'team', userProfile.email, 'sales'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(salesQuery);

      const salesData: SaleData[] = [];
      querySnapshot.forEach((doc) => {
        salesData.push(doc.data() as SaleData);
      });

      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Refresh sales data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userProfile?.email) {
        fetchSales();
      }
    }, [userProfile?.email, fetchSales])
  );

  const openSaleDetails = (sale: SaleData) => {
    setSelectedSale(sale);
    setModalVisible(true);
  };

  const closeSaleDetails = () => {
    setModalVisible(false);
    setSelectedSale(null);
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
    },
    headerTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '400',
    },
    profileIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors[colorScheme ?? 'dark'].background,
      shadowColor: Colors[colorScheme ?? 'dark'].tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      overflow: 'hidden',
    },
    profileIconText: {
      color: Colors[colorScheme ?? 'dark'].text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
    },
    newSaleCard: {
      marginTop: -30,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors[colorScheme ?? 'dark'].tint + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
    },
    spacer: {
      height: 20,
    },
    salesList: {
      flex: 1,
      paddingTop: 20,
      paddingBottom: 100,
    },
    saleCard: {
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: colorScheme === 'dark' ? 0.1 : 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    customerName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
    },
    contactInfo: {
      marginBottom: 4,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    detailIcon: {
      width: 14,
      marginRight: 6,
      textAlign: 'center',
    },
    detailText: {
      fontSize: 12,
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 1,
    },
    saleDate: {
      fontSize: 10,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'right',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].icon,
      textAlign: 'center',
      marginTop: 12,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      minHeight: '50%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'dark'].border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
    },
    detailSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'dark'].text,
      marginBottom: 12,
    },
    detailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    detailLabel: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].icon,
      fontWeight: '500',
      flex: 1,
    },
    detailValue: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      flex: 2,
      textAlign: 'right',
    },
    requirementDetail: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].text,
      lineHeight: 20,
      backgroundColor: Colors[colorScheme ?? 'dark'].card,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'dark'].border,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Sales</Text>
          <Text style={styles.subtitle}>Your Sale Data</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <View style={styles.profileIcon}>
            {profileData.profilepic ? (
              <Text style={styles.profileIconText}>
                {getInitials(profileData.name)}
              </Text>
            ) : (
              <Text style={styles.profileIconText}>
                {getInitials(profileData.name)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.salesList}
        showsVerticalScrollIndicator={false}
      >
        {/* Fill New Sale Card */}
        <TouchableOpacity
          style={styles.newSaleCard}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/sales-form')}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Ionicons name="add-circle" size={28} color={Colors[colorScheme ?? 'dark'].tint} />
            </View>
            <Text style={styles.cardTitle}>Fill New Sale</Text>
          </View>
        </TouchableOpacity>

        {/* Spacer after Fill New Sale card */}
        <View style={styles.spacer} />

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading sales...</Text>
          </View>
        )}

        {/* Sales List */}
        {!loading && sales.length > 0 && sales.map((sale) => (
          <TouchableOpacity
            key={sale.saleId}
            style={styles.saleCard}
            onPress={() => openSaleDetails(sale)}
            activeOpacity={0.7}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.customerName}>{sale.customerName}</Text>
              <Text style={styles.saleDate}>
                {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.detailRow}>
                <Ionicons name="call" size={12} color={Colors[colorScheme ?? 'dark'].icon} style={styles.detailIcon} />
                <Text style={styles.detailText}>{sale.phoneNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={12} color={Colors[colorScheme ?? 'dark'].icon} style={styles.detailIcon} />
                <Text style={styles.detailText}>
                  {sale.address.city}, {sale.address.state}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {!loading && sales.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt" size={48} color={Colors[colorScheme ?? 'dark'].icon} />
            <Text style={styles.emptyText}>
              No sales found.{'\n'}Create your first sale using the button above.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <DashboardNav active="sales" />

      {/* Sale Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeSaleDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sale Details</Text>
              <TouchableOpacity onPress={closeSaleDetails} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'dark'].text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {selectedSale && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Customer Info */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Customer Information</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedSale.customerName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedSale.phoneNumber}</Text>
                  </View>
                </View>

                {/* Address Info */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Address</Text>
                  {selectedSale.address.line1 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Line 1:</Text>
                      <Text style={styles.detailValue}>{selectedSale.address.line1}</Text>
                    </View>
                  )}
                  {selectedSale.address.line2 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Line 2:</Text>
                      <Text style={styles.detailValue}>{selectedSale.address.line2}</Text>
                    </View>
                  )}
                  {selectedSale.address.line3 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Line 3:</Text>
                      <Text style={styles.detailValue}>{selectedSale.address.line3}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>City:</Text>
                    <Text style={styles.detailValue}>{selectedSale.address.city}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>State:</Text>
                    <Text style={styles.detailValue}>{selectedSale.address.state}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Pincode:</Text>
                    <Text style={styles.detailValue}>{selectedSale.address.pincode}</Text>
                  </View>
                </View>

                {/* Site Requirements */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Site Requirements</Text>
                  <Text style={styles.requirementDetail}>{selectedSale.siteRequirement}</Text>
                </View>

                {/* Additional Notes */}
                {selectedSale.note && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.requirementDetail}>{selectedSale.note}</Text>
                  </View>
                )}

                {/* Sale Metadata */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Sale Information</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sale ID:</Text>
                    <Text style={styles.detailValue}>{selectedSale.saleId}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedSale.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Created By:</Text>
                    <Text style={styles.detailValue}>{selectedSale.createdBy}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
