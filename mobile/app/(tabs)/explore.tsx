import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiRequest from '@/lib/api';

interface ProfileEditData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  gender?: string;
  nationality?: string;
}

export default function ProfileScreen() {
  const { user, signOut, refreshAuth } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<ProfileEditData>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(editData),
      });
      
      await refreshAuth();
      setShowEditModal(false);
      setEditData({});
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      timezone: user?.timezone || '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
    });
    setShowEditModal(true);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#666" />
          </View>
          <Text style={styles.name}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil" size={16} color="#007AFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {formatJoinDate(typeof user?.createdAt === 'string' ? user.createdAt : user?.createdAt?.toISOString() || new Date().toISOString())}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#666" />
            <Text style={styles.infoLabel}>Onboarding</Text>
            <Text style={styles.infoValue}>
              {user?.isOnboarded === 'true' ? 'Completed' : 'Pending'}
            </Text>
          </View>

          {user?.bio && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color="#666" />
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{user.bio}</Text>
            </View>
          )}

          {user?.timezone && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.infoLabel}>Timezone</Text>
              <Text style={styles.infoValue}>{user.timezone}</Text>
            </View>
          )}

          {user?.gender && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{user.gender}</Text>
            </View>
          )}

          {user?.nationality && (
            <View style={styles.infoRow}>
              <Ionicons name="globe" size={20} color="#666" />
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue}>{user.nationality}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={20} color="#ff4444" />
            <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.saveButton}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={editData.firstName}
                onChangeText={(text) => setEditData({ ...editData, firstName: text })}
                placeholder="Enter your first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={editData.lastName}
                onChangeText={(text) => setEditData({ ...editData, lastName: text })}
                placeholder="Enter your last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.bio}
                onChangeText={(text) => setEditData({ ...editData, bio: text })}
                placeholder="Tell us a bit about yourself"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <TextInput
                style={styles.input}
                value={editData.gender}
                onChangeText={(text) => setEditData({ ...editData, gender: text })}
                placeholder="Enter your gender"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nationality</Text>
              <TextInput
                style={styles.input}
                value={editData.nationality}
                onChangeText={(text) => setEditData({ ...editData, nationality: text })}
                placeholder="Enter your nationality"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <TextInput
                style={styles.input}
                value={editData.timezone}
                onChangeText={(text) => setEditData({ ...editData, timezone: text })}
                placeholder="e.g., America/New_York"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
