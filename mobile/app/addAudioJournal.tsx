import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { useTheme } from "@/contexts/ThemeContext";
import { Header, Button, Card, LoadingAnimation } from "@/components/ui";
import {
  AudioWaveform,
  RecordingIndicator,
} from "@/components/audio/AudioWaveform";
import * as Haptics from "expo-haptics";

type RecordingState =
  | "initial"
  | "recording"
  | "paused"
  | "stopped"
  | "transcribing";

export default function AddAudioJournalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [recordingState, setRecordingState] =
    useState<RecordingState>("initial");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  React.useEffect(() => {
    requestPermissions();
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please grant microphone access to record audio."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingState("recording");
      setRecordingDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        setRecordingState("paused");
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to pause recording:", error);
    }
  };

  const resumeRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.startAsync();
        setRecordingState("recording");

        // Resume duration timer
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to resume recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        setRecordingState("stopped");

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const cancelRecording = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setRecordingState("initial");
    setRecordingDuration(0);
    recordingRef.current = null;
  };

  const confirmRecording = () => {
    setRecordingState("transcribing");

    // Simulate transcription process
    setTimeout(() => {
      Alert.alert(
        "Audio Journal Saved!",
        "Your audio has been transcribed and saved to your journal.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }, 3000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderInitialState = () => (
    <>
      <View style={styles.promptSection}>
        <Text style={[styles.promptText, { color: theme.colors.text }]}>
          Say anything that's on your mind!
        </Text>
        <Text
          style={[styles.promptSubtext, { color: theme.colors.textSecondary }]}
        >
          Share your thoughts, feelings, or anything you'd like to reflect on.
          Your audio will be automatically transcribed.
        </Text>
      </View>

      <View style={styles.microphoneSection}>
        <Pressable
          style={[
            styles.microphoneButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={startRecording}
        >
          <Text style={styles.microphoneIcon}>🎤</Text>
        </Pressable>
      </View>

      <Button
        title="Ready?"
        variant="primary"
        onPress={startRecording}
        style={styles.readyButton}
      />
    </>
  );

  const renderRecordingState = () => (
    <>
      <View style={styles.recordingHeader}>
        <RecordingIndicator isRecording={recordingState === "recording"} />
        <Text style={[styles.durationText, { color: theme.colors.text }]}>
          {formatDuration(recordingDuration)}
        </Text>
      </View>

      <View style={styles.waveformSection}>
        <AudioWaveform
          isRecording={recordingState === "recording"}
          width={300}
          height={100}
        />
      </View>

      <View style={styles.recordingControls}>
        <Button
          title="Cancel"
          variant="secondary"
          onPress={cancelRecording}
          style={styles.controlButton}
        />

        {recordingState === "recording" ? (
          <Button
            title="Pause"
            variant="secondary"
            onPress={pauseRecording}
            style={styles.controlButton}
          />
        ) : (
          <Button
            title="Resume"
            variant="secondary"
            onPress={resumeRecording}
            style={styles.controlButton}
          />
        )}

        <Button
          title="Done"
          variant="primary"
          onPress={stopRecording}
          style={styles.controlButton}
        />
      </View>

      <Text
        style={[styles.instructionText, { color: theme.colors.textTertiary }]}
      >
        Speak naturally and clearly for best transcription results
      </Text>
    </>
  );

  const renderStoppedState = () => (
    <>
      <View style={styles.stoppedHeader}>
        <Text style={[styles.stoppedTitle, { color: theme.colors.text }]}>
          Recording Complete
        </Text>
        <Text
          style={[
            styles.stoppedDuration,
            { color: theme.colors.textSecondary },
          ]}
        >
          Duration: {formatDuration(recordingDuration)}
        </Text>
      </View>

      <View style={styles.stoppedControls}>
        <Button
          title="Re-record"
          variant="secondary"
          onPress={() => {
            setRecordingState("initial");
            setRecordingDuration(0);
          }}
          style={styles.controlButton}
        />

        <Button
          title="Save & Transcribe"
          variant="primary"
          onPress={confirmRecording}
          style={styles.controlButton}
        />
      </View>
    </>
  );

  const renderTranscribingState = () => (
    <View style={styles.transcribingSection}>
      <LoadingAnimation variant="dots" size={48} />
      <Text style={[styles.transcribingText, { color: theme.colors.text }]}>
        Transcribing your audio...
      </Text>
      <Text
        style={[
          styles.transcribingSubtext,
          { color: theme.colors.textSecondary },
        ]}
      >
        This may take a few moments
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Audio Journal"
        showBackButton
        onBackPress={() => {
          if (recordingState !== "initial") {
            Alert.alert(
              "Discard Recording?",
              "Are you sure you want to leave? Your recording will be lost.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Discard",
                  style: "destructive",
                  onPress: () => router.back(),
                },
              ]
            );
          } else {
            router.back();
          }
        }}
      />

      <View style={styles.content}>
        <Card style={styles.mainCard}>
          {recordingState === "initial" && renderInitialState()}
          {(recordingState === "recording" || recordingState === "paused") &&
            renderRecordingState()}
          {recordingState === "stopped" && renderStoppedState()}
          {recordingState === "transcribing" && renderTranscribingState()}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainCard: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  promptSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  promptSubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  microphoneSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  microphoneIcon: {
    fontSize: 48,
  },
  readyButton: {
    alignSelf: "center",
    paddingHorizontal: 48,
  },
  recordingHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  durationText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  waveformSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  recordingControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flex: 1,
  },
  instructionText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  stoppedHeader: {
    alignItems: "center",
    marginBottom: 48,
  },
  stoppedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stoppedDuration: {
    fontSize: 16,
  },
  stoppedControls: {
    flexDirection: "row",
    gap: 12,
  },
  transcribingSection: {
    alignItems: "center",
    gap: 16,
  },
  transcribingText: {
    fontSize: 20,
    fontWeight: "600",
  },
  transcribingSubtext: {
    fontSize: 14,
  },
});
