import { Platform, StyleSheet, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PlaceholderTabScreen } from '../screens/PlaceholderTabScreen'
import { AccountScreen } from '../screens/AccountScreen'

export type MainTabParamList = {
  Dashboard: undefined
  Chat: undefined
  Onderhoud: undefined
  Documenten: undefined
  Account: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

const green = '#163300'
const inactive = '#9ca3af'

/** iOS: frosted “liquid” bar (system chrome material). */
function TabBarBackgroundIOS() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView
        intensity={88}
        tint="systemChromeMaterialLight"
        style={StyleSheet.absoluteFill}
      />
      {/* Subtiele bovenrand zoals native tab bars */}
      <View style={styles.iosHairline} />
    </View>
  )
}

export function MainTabs() {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 12)

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: green,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: Platform.OS === 'ios' ? -0.1 : 0.15,
        },
        tabBarItemStyle: {
          paddingTop: Platform.OS === 'android' ? 4 : 2,
        },
        tabBarStyle: Platform.select({
          // Geen position:absolute — anders schuift content onder de bar. Blur vult alleen de tab-balk.
          ios: {
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            height: 52 + bottomPad,
            paddingTop: 6,
            paddingBottom: bottomPad,
          },
          android: {
            // Material 3-achtig oppervlak + elevation (native schaduw)
            backgroundColor: '#F7F2FA',
            borderTopWidth: 0,
            elevation: 5,
            height: 60 + bottomPad,
            paddingTop: 6,
            paddingBottom: bottomPad,
          },
          default: {},
        }),
        tabBarBackground: Platform.OS === 'ios' ? () => <TabBarBackgroundIOS /> : undefined,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <PlaceholderTabScreen title="Dashboard" />}
      </Tab.Screen>
      <Tab.Screen
        name="Chat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <PlaceholderTabScreen title="Chat" />}
      </Tab.Screen>
      <Tab.Screen
        name="Onderhoud"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wrench-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <PlaceholderTabScreen title="Onderhoud" />}
      </Tab.Screen>
      <Tab.Screen
        name="Documenten"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <PlaceholderTabScreen title="Documenten" />}
      </Tab.Screen>
      <Tab.Screen
        name="Account"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
        component={AccountScreen}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iosHairline: {
    ...StyleSheet.absoluteFillObject,
    bottom: undefined,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60, 60, 67, 0.22)',
  },
})
