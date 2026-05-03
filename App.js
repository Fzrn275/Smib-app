// IMPORTANT: gesture-handler import must be the very first line
import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import * as Linking from 'expo-linking';
import { syncOfflineQueue } from './src/services/progressService';
import { handleAuthURL }    from './src/services/authService';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Nunito_900Black,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import RootNavigator          from './src/navigation/RootNavigator';
import { LanguageProvider }   from './src/context/LanguageContext';

const AppTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent', card: 'transparent' },
};

// Keep the splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_900Black,
    Nunito_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    // Handle smib:// deep links for email confirmation, password reset, and OAuth.
    // Supabase redirects to smib:// after verifying the email or OAuth token.
    // detectSessionInUrl is false in supabaseClient, so we handle it manually here.
    Linking.getInitialURL().then(url => { if (url) handleAuthURL(url); });
    const linkSub = Linking.addEventListener('url', ({ url }) => handleAuthURL(url));
    return () => linkSub.remove();
  }, []);

  useEffect(() => {
    // Attempt to sync any steps that were queued while offline
    // whenever the app comes back to the foreground
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncOfflineQueue().catch(() => {
          // Silently fail — will retry on next foreground event
        });
      }
    });
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <NavigationContainer theme={AppTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
