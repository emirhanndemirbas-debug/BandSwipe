import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';

const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  accent: '#E91E8C',
  text: '#FFFFFF',
  sub: '#888888',
  border: '#2A2A2A',
  input: '#141414',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleEmailLogin() {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Email ve şifre gereklidir.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Email adresini henüz doğrulamadın. Gelen kutunu kontrol et.');
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Email veya şifre hatalı.');
      } else {
        setErrorMsg(error.message);
      }
    }
  }

  async function handleGoogleLogin() {
    const redirectTo = 'bandswipe://auth-callback';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      Alert.alert('Hata', error?.message ?? 'Google girişi başlatılamadı.');
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      const fragment = result.url.includes('#')
        ? result.url.split('#')[1]
        : result.url.split('?')[1] ?? '';
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  }

  async function handleAppleLogin() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        Alert.alert('Hata', 'Apple kimlik doğrulaması başarısız.');
        return;
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) Alert.alert('Apple giriş hatası', error.message);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Hata', e.message);
      }
    }
  }

  return (
    <SafeAreaView style={styles.flex}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.title}>BandSwipe</Text>
          <Text style={styles.subtitle}>Müzisyenler ve bandlar buluşuyor</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={C.sub}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor={C.sub}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, styles.btnAccent, loading && styles.btnDisabled]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleGoogleLogin}>
            <Text style={styles.btnOutlineText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={8}
              style={styles.appleBtn}
              onPress={handleAppleLogin}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: C.sub,
    fontSize: 14,
    marginTop: 6,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    color: C.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAccent: {
    backgroundColor: C.accent,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.border,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnOutlineText: {
    color: C.text,
    fontSize: 15,
    fontWeight: '500',
  },
  appleBtn: {
    height: 50,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    color: C.sub,
    fontSize: 12,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: C.sub,
    fontSize: 14,
  },
  footerLink: {
    color: C.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
