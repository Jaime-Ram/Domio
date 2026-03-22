import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function PlaceholderTabScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>Hier komt de app-functionaliteit.</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#163300',
  },
  sub: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
})
