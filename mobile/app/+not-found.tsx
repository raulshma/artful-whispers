import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Page Not Found',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }}
      />
      
      <View style={styles.content}>
        <Card style={styles.errorCard}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.textTertiary + '20' }]}>
              <IconSymbol
                name="questionmark.circle.fill"
                size={64}
                color={theme.colors.textTertiary}
              />
            </View>
          </View>

          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Oops! Page Not Found
          </Text>
          
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            The page you're looking for doesn't exist or may have been moved.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Go Back"
              variant="secondary"
              onPress={handleGoBack}
              style={styles.button}
            />
            
            <Button
              title="Go to Home"
              variant="primary"
              onPress={handleGoHome}
              style={styles.button}
            />
          </View>
        </Card>

        <View style={styles.helpSection}>
          <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
            Need Help?
          </Text>
          <Text style={[styles.helpMessage, { color: theme.colors.textSecondary }]}>
            If you believe this is an error, please try refreshing the app or contact support.
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  helpSection: {
    alignItems: 'center',
    gap: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
