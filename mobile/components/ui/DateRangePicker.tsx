import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
  key: string;
}

interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const predefinedRanges: DateRange[] = [
  {
    key: "last7days",
    label: "Last 7 days",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    key: "last30days",
    label: "Last 30 days",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  {
    key: "currentMonth",
    label: "This month",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  },
  {
    key: "lastMonth",
    label: "Last month",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
  },
  {
    key: "last3months",
    label: "Last 3 months",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    endDate: new Date(),
  },
  {
    key: "last6months",
    label: "Last 6 months",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
    endDate: new Date(),
  },
  {
    key: "currentYear",
    label: "This year",
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  },
  {
    key: "allTime",
    label: "All time",
    startDate: new Date(2020, 0, 1), // Reasonable start date for the app
    endDate: new Date(),
  },
];

export default function DateRangePicker({
  selectedRange,
  onRangeChange,
}: DateRangePickerProps) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const styles = createStyles(theme);
  const handleRangeSelect = (range: DateRange) => {
    console.log("DateRangePicker: Range selected:", range.label, range.key);
    alert(`Selected: ${range.label}`); // Temporary for testing
    onRangeChange(range);
    setModalVisible(false);
  };

  const formatDateRange = (range: DateRange) => {
    const startMonth = range.startDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const startDay = range.startDate.getDate();
    const endMonth = range.endDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const endDay = range.endDate.getDate();

    if (range.key === "allTime") {
      return "All time";
    }

    if (
      range.startDate.getMonth() === range.endDate.getMonth() &&
      range.startDate.getFullYear() === range.endDate.getFullYear()
    ) {
      return `${startMonth} ${startDay}-${endDay}`;
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.triggerContent}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.triggerText, { color: theme.colors.text }]}>
            {selectedRange.label}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(200)}
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Select Date Range
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.rangeList}
                showsVerticalScrollIndicator={false}
              >
                {predefinedRanges.map((range, index) => (
                  <Animated.View
                    key={range.key}
                    entering={FadeIn.delay(index * 50).duration(300)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.rangeItem,
                        selectedRange.key === range.key && {
                          backgroundColor: theme.colors.primary + "20",
                          borderColor: theme.colors.primary,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => handleRangeSelect(range)}
                    >
                      <View style={styles.rangeItemContent}>
                        <Text
                          style={[
                            styles.rangeLabel,
                            { color: theme.colors.text },
                            selectedRange.key === range.key && {
                              color: theme.colors.primary,
                            },
                          ]}
                        >
                          {range.label}
                        </Text>
                        <Text
                          style={[
                            styles.rangeDates,
                            { color: theme.colors.textSecondary },
                            selectedRange.key === range.key && {
                              color: theme.colors.primary + "CC",
                            },
                          ]}
                        >
                          {formatDateRange(range)}
                        </Text>
                      </View>
                      {selectedRange.key === range.key && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    triggerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    triggerText: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)"
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      maxHeight: height * 0.7,
      minHeight: 300,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    closeButton: {
      padding: 4,
    },
    rangeList: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },
    rangeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    rangeItemContent: {
      flex: 1,
    },
    rangeLabel: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 4,
    },
    rangeDates: {
      fontSize: 14,
    },
  });
