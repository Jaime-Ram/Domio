import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'

export function AccountScreen() {
  const { session, signOut } = useAuth()
  const email = session?.user?.email ?? '—'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.box}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.email}>{email}</Text>
        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
          onPress={() => {
            Alert.alert('Uitloggen', 'Weet je het zeker?', [
              { text: 'Annuleren', style: 'cancel' },
              { text: 'Uitloggen', style: 'destructive', onPress: () => void signOut() },
            ])
          }}
        >
          <Text style={styles.outlineBtnText}>Uitloggen</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  box: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#163300' },
  email: { marginTop: 8, fontSize: 15, color: '#6b7280' },
  outlineBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  pressed: { opacity: 0.85 },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
})
