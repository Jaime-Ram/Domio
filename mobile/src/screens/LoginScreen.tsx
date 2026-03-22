import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { translateAuthError } from '../lib/auth-errors'

const DOMIO_GREEN = '#9FE870'
const DOMIO_DARK = '#163300'

const webBase = (process.env.EXPO_PUBLIC_WEB_APP_URL ?? '').replace(/\/$/, '')

function openWeb(path: string) {
  if (!webBase) {
    Alert.alert(
      'Link niet geconfigureerd',
      'Zet EXPO_PUBLIC_WEB_APP_URL in mobile/.env (bijv. https://jouw-domein.nl) om te registreren of wachtwoord te resetten.'
    )
    return
  }
  void Linking.openURL(`${webBase}${path}`)
}

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    if (!supabaseConfigured) {
      setError('Supabase niet geconfigureerd. Vul EXPO_PUBLIC_SUPABASE_URL en EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env en herstart Expo.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) throw authError
      // Sessie gaat via onAuthStateChange; optioneel: custom 2FA op web — app gebruikt voor nu alleen Supabase-sessie.
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(translateAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.closeBtn}
          onPress={() => {
            if (webBase) void Linking.openURL(webBase)
            else
              Alert.alert('Domio', 'Stel EXPO_PUBLIC_WEB_APP_URL in om naar de website te gaan, of sluit de app.')
          }}
          accessibilityLabel="Sluiten"
        >
          <MaterialCommunityIcons name="close" size={22} color="#6b7280" />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!supabaseConfigured && (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>
                Voeg Supabase-keys toe aan <Text style={styles.mono}>mobile/.env</Text> (zie .env.example) en herstart
                met <Text style={styles.mono}>npx expo start</Text>.
              </Text>
            </View>
          )}

          <Text style={styles.h1}>Welkom terug!</Text>
          <Text style={styles.lead}>
            Nog geen account?{' '}
            <Text style={styles.link} onPress={() => openWeb('/registreren')}>
              Registreren
            </Text>
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.label}>E-mailadres</Text>
            <TextInput
              style={styles.input}
              placeholder="naam@voorbeeld.nl"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Wachtwoord</Text>
              <Text style={styles.linkSmall} onPress={() => openWeb('/forgot-password')}>
                Vergeten?
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.checkboxRow}>
              <Checkbox
                value={rememberMe}
                onValueChange={setRememberMe}
                color={rememberMe ? DOMIO_DARK : '#d1d5db'}
              />
              <Text style={styles.checkboxLabel}>Onthoud mij</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed, loading && styles.disabled]}
              onPress={() => void onSubmit()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={DOMIO_DARK} />
              ) : (
                <Text style={styles.primaryBtnText}>Inloggen</Text>
              )}
            </Pressable>

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Of log in met</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable
                style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed]}
                onPress={() =>
                  Alert.alert(
                    'Google',
                    'OAuth in de app volgt (deep link + Supabase redirect). Gebruik nu e-mail en wachtwoord.'
                  )
                }
              >
                <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed]}
                onPress={() =>
                  Alert.alert(
                    'Microsoft',
                    'OAuth in de app volgt. Gebruik nu e-mail en wachtwoord.'
                  )
                }
              >
                <MaterialCommunityIcons name="microsoft" size={22} color="#00A4EF" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed]}
                onPress={() =>
                  Alert.alert(
                    'Apple',
                    'Sign in with Apple volgt. Gebruik nu e-mail en wachtwoord.'
                  )
                }
              >
                <MaterialCommunityIcons name="apple" size={22} color="#111827" />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.passkeyBtn, pressed && styles.socialPressed]}
              onPress={() =>
                Alert.alert(
                  'Passkey',
                  'Passkeys zijn op de website beschikbaar. In de app gebruik je e-mail en wachtwoord.'
                )
              }
            >
              <MaterialCommunityIcons name="key-variant" size={20} color="#374151" />
              <Text style={styles.passkeyText}>Inloggen met passkey</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
    padding: 10,
    borderRadius: 9999,
  },
  scroll: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  warnBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warnText: { fontSize: 13, color: '#92400e', lineHeight: 18 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: DOMIO_DARK,
    letterSpacing: -0.5,
  },
  lead: { marginTop: 8, fontSize: 14, color: '#4b5563' },
  link: { fontWeight: '600', color: DOMIO_DARK, textDecorationLine: 'underline' },
  linkSmall: { fontSize: 14, fontWeight: '500', color: DOMIO_DARK, textDecorationLine: 'underline' },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { fontSize: 14, color: '#b91c1c' },
  form: { marginTop: 28 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  primaryBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 9999,
    backgroundColor: DOMIO_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryBtnPressed: { opacity: 0.92 },
  disabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: DOMIO_DARK },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
    gap: 10,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 13, color: '#6b7280' },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'space-between' },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialPressed: { backgroundColor: '#f9fafb' },
  passkeyBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  passkeyText: { fontSize: 14, fontWeight: '600', color: '#374151' },
})
