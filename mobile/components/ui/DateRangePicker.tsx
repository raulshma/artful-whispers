import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const styles = createStyles(theme);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ["50%", "70%"], []);

  const handleRangeSelect = useCallback(
    (range: DateRange) => {
      console.log("DateRangePicker: Range selected:", range.label, range.key);
      onRangeChange(range);
      bottomSheetModalRef.current?.close();
    },
    [onRangeChange]
  );

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

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
      {/* Trigger Button */}
      <TouchableOpacity style={styles.trigger} onPress={handleOpenBottomSheet}>
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
      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.textSecondary,
          width: 40,
          height: 4,
        }}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <BottomSheetView
          style={[
            styles.bottomSheetContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.bottomSheetTitle, { color: theme.colors.text }]}>
            Select Date Range
          </Text>
          <BottomSheetScrollView
            style={styles.bottomSheetList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {predefinedRanges.map((range, index) => (
              <Animated.View
                key={range.key}
                entering={FadeIn.delay(index * 50).duration(300)}
              >
                <TouchableOpacity
                  style={[
                    styles.rangeItem,
                    { backgroundColor: theme.colors.backgroundSecondary },
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
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
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
      backgroundColor: theme.colors.backgroundSecondary,
      marginBottom: 16,
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
    bottomSheetContent: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: "transparent", // Let the background style handle the color
    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 20,
      marginTop: 8,
    },
    bottomSheetList: {
      flex: 1,
      paddingHorizontal: 4,
    },
    rangeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 1.5,
      elevation: 2,
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
