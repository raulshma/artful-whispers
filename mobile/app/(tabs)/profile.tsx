import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Share,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button, Card, ListItem } from "@/components/ui";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { ShadowFriendlyAnimation } from "@/components/ui/ShadowFriendlyAnimation";
import * as Haptics from "expo-haptics";
import {
  fetchUserProfile,
  fetchUserStats,
  fetchUserSettings,
  updateUserSettings,
  exportUserData,
  deleteUserAccount,
  syncUserStats,
  type UserProfile,
  type UserStats,
  type UserSettings,
} from "@/lib/api";

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State for data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingStats, setSyncingStats] = useState(false);

  // Local state for UI
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notificationsEnabled);
      setReminderEnabled(settings.reminderEnabled);
      setIsDarkMode(settings.darkModeEnabled);
    }
  }, [settings]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, settingsData] = await Promise.all([
        fetchUserProfile(),
        fetchUserStats(),
        fetchUserSettings(),
      ]);
      
      setProfile(profileData);
      setStats(statsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateSettingValue = async (key: keyof Pick<UserSettings, 'notificationsEnabled' | 'reminderEnabled' | 'darkModeEnabled'>, value: boolean) => {
    try {
      const updatedSettings = await updateUserSettings({ [key]: value });
      setSettings(updatedSettings);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      Alert.alert('Error', `Failed to update ${key}`);
      
      // Revert local state
      if (key === 'notificationsEnabled') setNotificationsEnabled(!value);
      if (key === 'reminderEnabled') setReminderEnabled(!value);
      if (key === 'darkModeEnabled') setIsDarkMode(!value);
    }
  };

  const handleSyncStats = async () => {
    try {
      setSyncingStats(true);
      const response = await syncUserStats();
      setStats(response.stats);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Journey stats have been synced successfully!');
    } catch (error) {
      console.error('Failed to sync stats:', error);
      Alert.alert('Error', 'Failed to sync journey stats. Please try again.');
    } finally {
      setSyncingStats(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing coming soon!");
  };

  const handleExportData = async () => {
    try {
      const blob = await exportUserData();
      
      if (Platform.OS === 'web') {
        // For web, create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use Share API
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            await Share.share({
              message: reader.result as string,
              title: 'User Data Export',
            });
          } catch (error) {
            console.error('Share error:', error);
          }
        };
        reader.readAsText(blob);
      }
      
      Alert.alert("Success", "Your data has been exported successfully!");
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.prompt(
              "Confirm Deletion",
              'Type "DELETE" to confirm account deletion',
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Account",
                  style: "destructive",
                  onPress: async (text) => {
                    if (text === "DELETE") {
                      try {
                        await deleteUserAccount();
                        await signOut();
                        Alert.alert("Account Deleted", "Your account has been permanently deleted.");
                      } catch (error) {
                        console.error('Delete account error:', error);
                        Alert.alert("Error", "Failed to delete account");
                      }
                    } else {
                      Alert.alert("Error", "Please type 'DELETE' to confirm");
                    }
                  },
                },
              ],
              "plain-text"
            );
          },
        },
      ]
    );
  };

  const handleToggleTheme = async (value: boolean) => {
    setIsDarkMode(value);
    toggleTheme();
    await updateSettingValue('darkModeEnabled', value);
  };

  const settingsItems = [
    {
      id: "notifications",
      title: "Push Notifications",
      subtitle: "Get notified about your check-ins",
      icon: "bell.fill",
      type: "switch" as const,
      value: notificationsEnabled,
      onToggle: (value: boolean) => {
        setNotificationsEnabled(value);
        updateSettingValue('notificationsEnabled', value);
      },
    },
    {
      id: "reminders",
      title: "Daily Reminders",
      subtitle: "Remind me to check in daily",
      icon: "clock.fill",
      type: "switch" as const,
      value: reminderEnabled,
      onToggle: (value: boolean) => {
        setReminderEnabled(value);
        updateSettingValue('reminderEnabled', value);
      },
    },
    {
      id: "theme",
      title: "Dark Mode",
      subtitle: "Switch between light and dark themes",
      icon: "moon.fill",
      type: "switch" as const,
      value: isDarkMode,
      onToggle: handleToggleTheme,
    },
  ];

  const accountItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "person.circle.fill",
      type: "arrow" as const,
      onPress: handleEditProfile,
    },
    {
      id: "export-data",
      title: "Export Data",
      subtitle: "Download your journal entries",
      icon: "square.and.arrow.up.fill",
      type: "arrow" as const,
      onPress: handleExportData,
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      subtitle: "Read our privacy policy",
      icon: "lock.shield.fill",
      type: "arrow" as const,
      onPress: () =>
        Alert.alert("Privacy Policy", "Privacy policy coming soon!"),
    },
    {
      id: "terms",
      title: "Terms of Service",
      subtitle: "Read our terms of service",
      icon: "doc.text.fill",
      type: "arrow" as const,
      onPress: () =>
        Alert.alert("Terms of Service", "Terms of service coming soon!"),
    },
  ];
  return (
    <AnimatedPageWrapper animationType="fadeIn">
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >          <View style={styles.content}>
            {/* User Profile Header */}
            <ShadowFriendlyAnimation index={0} animationType="slideUp">
              <Card style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <View
                    style={[
                      styles.avatarContainer,
                      { backgroundColor: theme.colors.primary + "20" },
                    ]}
                  >
                    <IconSymbol
                      name="person.fill"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>
                      {profile?.name || user?.name || "User"}
                    </Text>
                    <Text
                      style={[
                        styles.userEmail,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {profile?.email || user?.email || "user@example.com"}
                    </Text>
                    <Text
                      style={[
                        styles.joinDate,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      Member since {profile?.joinDate
                        ? new Date(profile.joinDate).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                      }
                    </Text>
                  </View>

                  <Button
                    title="Edit"
                    variant="secondary"
                    onPress={handleEditProfile}
                    style={styles.editButton}
                  />
                </View>              </Card>
            </ShadowFriendlyAnimation>
            {/* Stats Overview */}
            <ShadowFriendlyAnimation index={1} animationType="slideUp">
              <Card style={styles.statsCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Your Journey
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text
                      style={[styles.statNumber, { color: theme.colors.primary }]}
                    >
                      {loading ? "..." : stats?.checkInsCount || 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Check-ins
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[styles.statNumber, { color: theme.colors.primary }]}
                    >
                      {loading ? "..." : stats?.journalEntriesCount || 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Journal Entries
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[styles.statNumber, { color: theme.colors.primary }]}
                    >
                      {loading ? "..." : stats?.currentStreak || 0}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Day Streak
                    </Text>
                  </View>
                </View>              </Card>
            </ShadowFriendlyAnimation>
            {/* Settings */}
            <ShadowFriendlyAnimation index={2} animationType="slideUp">
              <Card style={styles.settingsCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Preferences
                </Text>
                {settingsItems.map((item) => (
                  <ListItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    leftIcon={item.icon}
                    rightComponent={
                      <Switch
                        value={item.value}
                        onValueChange={(value) => {
                          item.onToggle(value);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        trackColor={{
                          false: theme.colors.border,
                          true: theme.colors.primary + "80",
                        }}
                        thumbColor={
                          item.value ? theme.colors.primary : theme.colors.surface
                        }
                      />
                    }
                  />
                ))}              </Card>
            </ShadowFriendlyAnimation>
            {/* Account */}
            <ShadowFriendlyAnimation index={3} animationType="slideUp">
              <Card style={styles.accountCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Account
                </Text>
                {accountItems.map((item) => (
                  <ListItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    leftIcon={item.icon}
                    rightIcon="chevron.right"
                    onPress={item.onPress}
                  />
                ))}
              </Card>
            </ShadowFriendlyAnimation>
            {/* Danger Zone */}
            <Card style={styles.dangerCard}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.semantic.error },
                ]}
              >
                Danger Zone
              </Text>
              <ListItem
                title={syncingStats ? "Syncing Journey Stats..." : "Sync Journey Stats"}
                subtitle="Recalculate all statistics from your data"
                leftIcon="arrow.clockwise.circle.fill"
                rightIcon="chevron.right"
                onPress={handleSyncStats}
                disabled={syncingStats}
              />
              <ListItem
                title="Delete Account"
                subtitle="Permanently delete your account and all data"
                leftIcon="trash.fill"
                rightIcon="chevron.right"
                onPress={handleDeleteAccount}
                titleStyle={{ color: theme.colors.semantic.error }}
              />
            </Card>
            {/* Sign Out Button */}
            <View style={styles.signOutSection}>
              <Button
                title="Sign Out"
                variant="secondary"
                onPress={handleSignOut}
                style={styles.signOutButton}              />
            </View>
          </View>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
  },
  joinDate: {
    fontSize: 12,
  },
  editButton: {
    paddingHorizontal: 16,
  },
  statsCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  settingsCard: {
    padding: 20,
    marginBottom: 16,
  },
  accountCard: {
    padding: 20,
    marginBottom: 16,
  },
  dangerCard: {
    padding: 20,
    marginBottom: 16,
  },
  signOutSection: {
    marginTop: 24,
  },
  signOutButton: {
    width: "100%",
    marginBottom: 65
  },
});
