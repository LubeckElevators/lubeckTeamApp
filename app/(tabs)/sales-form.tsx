import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalesFormScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    pincode: '',
    siteRequirement: '',
    note: '',
  });

  const updateFormData = React.useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      if (prev[field] === value) return prev; // Prevent unnecessary updates
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  // Create stable change handlers for each field
  const handleNameChange = React.useCallback((value: string) => updateFormData('name', value), [updateFormData]);
  const handlePhoneChange = React.useCallback((value: string) => updateFormData('phoneNumber', value), [updateFormData]);
  const handleAddressLine1Change = React.useCallback((value: string) => updateFormData('addressLine1', value), [updateFormData]);
  const handleAddressLine2Change = React.useCallback((value: string) => updateFormData('addressLine2', value), [updateFormData]);
  const handleAddressLine3Change = React.useCallback((value: string) => updateFormData('addressLine3', value), [updateFormData]);
  const handleCityChange = React.useCallback((value: string) => updateFormData('city', value), [updateFormData]);
  const handleStateChange = React.useCallback((value: string) => updateFormData('state', value), [updateFormData]);
  const handlePincodeChange = React.useCallback((value: string) => updateFormData('pincode', value), [updateFormData]);
  const handleSiteRequirementChange = React.useCallback((value: string) => updateFormData('siteRequirement', value), [updateFormData]);
  const handleNoteChange = React.useCallback((value: string) => updateFormData('note', value), [updateFormData]);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter the customer name');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter the phone number');
      return;
    }

    if (!userProfile?.email) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    try {
      // Generate current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get last 5 digits of phone number
      const last5Digits = formData.phoneNumber.trim().slice(-5);

      // Generate sale ID: {NameWithoutSpaces}{PhoneNumberLast5Digits}{CurrentDate}
      const nameWithoutSpaces = formData.name.trim().replace(/\s+/g, '');
      const saleId = `${nameWithoutSpaces}${last5Digits}${currentDate}`;

      // Prepare sale data
      const saleData = {
        saleId: saleId,
        customerName: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: {
          line1: formData.addressLine1.trim(),
          line2: formData.addressLine2.trim(),
          line3: formData.addressLine3.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        siteRequirement: formData.siteRequirement.trim(),
        note: formData.note.trim(),
        createdAt: new Date().toISOString(),
        createdBy: userProfile.email,
      };

      // Save to Firestore: team/{EmailID}/sales/{saleId}
      const saleDocRef = doc(db, 'team', userProfile.email, 'sales', saleId);
      await setDoc(saleDocRef, saleData);

      Alert.alert(
        'Success',
        'Sale form submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving sale:', error);
      Alert.alert(
        'Error',
        'Failed to submit sale form. Please try again.'
      );
    }
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme ?? 'dark'].background}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme ?? 'dark'].text}
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'dark'].text }]}>
            New Sale
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].background,
                borderColor: Colors[colorScheme ?? 'dark'].border,
                color: Colors[colorScheme ?? 'dark'].text
              }
            ]}
            value={formData.name}
            onChangeText={handleNameChange}
            placeholder="Enter customer name"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            autoCapitalize="words"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Phone Number
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].background,
                borderColor: Colors[colorScheme ?? 'dark'].border,
                color: Colors[colorScheme ?? 'dark'].text
              }
            ]}
            value={formData.phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="Enter phone number"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            keyboardType="phone-pad"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        {/* Address Fields */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Address
          </Text>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Address Line 1
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.addressLine1}
              onChangeText={handleAddressLine1Change}
              placeholder="Street address"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Address Line 2
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.addressLine2}
              onChangeText={handleAddressLine2Change}
              placeholder="Apartment, suite, etc. (optional)"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Address Line 3
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.addressLine3}
              onChangeText={handleAddressLine3Change}
              placeholder="Landmark (optional)"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              City
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.city}
              onChangeText={handleCityChange}
              placeholder="Enter city"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              State
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.state}
              onChangeText={handleStateChange}
              placeholder="Enter state"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
              Pincode
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: Colors[colorScheme ?? 'dark'].background,
                  borderColor: Colors[colorScheme ?? 'dark'].border,
                  color: Colors[colorScheme ?? 'dark'].text
                }
              ]}
              value={formData.pincode}
              onChangeText={handlePincodeChange}
              placeholder="Enter pincode"
              placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
              keyboardType="numeric"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Site Requirement
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.multilineInput,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].background,
                borderColor: Colors[colorScheme ?? 'dark'].border,
                color: Colors[colorScheme ?? 'dark'].text
              }
            ]}
            value={formData.siteRequirement}
            onChangeText={handleSiteRequirementChange}
            placeholder="Describe the site requirements in detail..."
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'dark'].text }]}>
            Note
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.multilineInput,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].background,
                borderColor: Colors[colorScheme ?? 'dark'].border,
                color: Colors[colorScheme ?? 'dark'].text
              }
            ]}
            value={formData.note}
            onChangeText={handleNoteChange}
            placeholder="Additional notes (optional)"
            placeholderTextColor={Colors[colorScheme ?? 'dark'].icon}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: Colors[colorScheme ?? 'dark'].tint,
                shadowColor: Colors[colorScheme ?? 'dark'].tint
              }
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Sale</Text>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.submitIcon} />
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
});
