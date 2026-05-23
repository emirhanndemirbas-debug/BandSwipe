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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password || !confirm) {
      Alert.alert('Eksik bilgi', 'Tüm alanları doldur.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Şifre hatası', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Şifre hatası', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Kayıt hatası', error.message);
      return;
    }
    // Eğer email doğrulama açıksa session gelmez → mesaj göster
    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Email gönderildi!</Text>
          <Text style={styles.successText}>
            {email} adresine doğrulama linki gönderildi. Lütfen emailini kontrol et ve linke tıkla.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={StyleSheet.flatten([styles.btn, styles.btnAccent])}>
              <Text style={styles.btnText}>Giriş Yap</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>BandSwipe'a katıl</Text>

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
            placeholder="Şifre (min. 6 karakter)"
            placeholderTextColor={C.sub}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre tekrar"
            placeholderTextColor={C.sub}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="new-password"
          />

          <TouchableOpacity
            style={[styles.btn, styles.btnAccent, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Giriş Yap</Text>
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
  centeredContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  successTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  successText: {
    color: C.sub,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: C.sub,
    fontSize: 14,
    marginBottom: 32,
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
    marginTop: 4,
  },
  btnAccent: {
    backgroundColor: C.accent,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
