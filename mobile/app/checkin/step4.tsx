import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useCheckIn } from "@/contexts/CheckInContext";
import { Header, Button, Card, Input } from "@/components/ui";
import { IconSymbol } from "@/components/ui/IconSymbol";
import * as Haptics from "expo-haptics";

const SUGGESTED_LOCATIONS = [
  { id: "home", label: "Home", icon: "house.fill" },
  { id: "work", label: "Work", icon: "building.2.fill" },
  { id: "gym", label: "Gym", icon: "figure.walk" },
  { id: "park", label: "Park", icon: "tree.fill" },
  { id: "restaurant", label: "Restaurant", icon: "fork.knife" },
  { id: "cafe", label: "Café", icon: "cup.and.saucer.fill" },
  { id: "school", label: "School", icon: "graduationcap.fill" },
  { id: "shopping", label: "Shopping", icon: "bag.fill" },
  { id: "transport", label: "Transportation", icon: "car.fill" },
  { id: "outdoors", label: "Outdoors", icon: "sun.max.fill" },
];

export default function CheckinStep4() {
  const { theme } = useTheme();
  const router = useRouter();
  const { checkInData, updateCheckInData } = useCheckIn();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    checkInData.location && SUGGESTED_LOCATIONS.find(l => l.label === checkInData.location)?.id || null
  );
  const [customLocation, setCustomLocation] = useState(
    checkInData.location && !SUGGESTED_LOCATIONS.find(l => l.label === checkInData.location)
      ? checkInData.location
      : ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setCustomLocation("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCustomLocationChange = (text: string) => {
    setCustomLocation(text);
    if (text.trim()) {
      setSelectedLocation(null);
    }
  };

  const handleContinue = () => {
    const location = selectedLocation
      ? SUGGESTED_LOCATIONS.find((l) => l.id === selectedLocation)?.label
      : customLocation;

    updateCheckInData({
      location: location || "Not specified",
      customLocationDetails: customLocation || undefined,
    });
    router.push("/checkin/complete" as any);
  };

  const handleSkip = () => {
    updateCheckInData({
      location: "Not specified",
      customLocationDetails: undefined,
    });
    router.push("/checkin/complete" as any);
  };

  const filteredLocations = SUGGESTED_LOCATIONS.filter((location) =>
    location.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Check In"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.questionSection}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              Where are you?
            </Text>
            <Text
              style={[
                styles.questionSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              Help us understand your environment (optional)
            </Text>
          </View>

          {/* Search Input */}
          <Card style={styles.searchCard}>
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={
                <IconSymbol
                  name="magnifyingglass"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
            />
          </Card>

          {/* Suggested Locations */}
          <Card style={styles.locationsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Suggested Locations
            </Text>
            <View style={styles.locationsGrid}>
              {filteredLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationItem,
                    {
                      backgroundColor:
                        selectedLocation === location.id
                          ? theme.colors.primary + "20"
                          : theme.colors.surface,
                      borderColor:
                        selectedLocation === location.id
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleLocationSelect(location.id)}
                >
                  <IconSymbol
                    name={location.icon as any}
                    size={24}
                    color={
                      selectedLocation === location.id
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.locationLabel,
                      {
                        color:
                          selectedLocation === location.id
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {location.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Custom Location */}
          <Card style={styles.customCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Or Enter Custom Location
            </Text>
            <Input
              placeholder="Type your location..."
              value={customLocation}
              onChangeText={handleCustomLocationChange}
              leftIcon={
                <IconSymbol
                  name="location.fill"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
            />
          </Card>

          {/* Selected Location Display */}
          {(selectedLocation || customLocation.trim()) && (
            <Card style={styles.selectionCard}>
              <Text
                style={[styles.selectionTitle, { color: theme.colors.text }]}
              >
                Selected Location:
              </Text>
              <Text
                style={[styles.selectionText, { color: theme.colors.primary }]}
              >
                {selectedLocation
                  ? SUGGESTED_LOCATIONS.find((l) => l.id === selectedLocation)
                      ?.label
                  : customLocation}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button
            title="Skip"
            variant="secondary"
            onPress={handleSkip}
            style={styles.skipButton}
          />
          <Button
            title="Continue"
            variant="primary"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressIndicator}>
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                styles.progressDotActive,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.textTertiary }]}
          >
            Step 4 of 5
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
  questionSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  locationsCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  locationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  customCard: {
    padding: 20,
    marginBottom: 16,
  },
  selectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  progressSection: {
    alignItems: "center",
    gap: 12,
  },
  progressIndicator: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 16,
  },
  progressText: {
    fontSize: 12,
  },
});
