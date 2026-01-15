import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TarotReadersScreen from './src/screens/TarotReadersScreen';
import { COLORS } from './src/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthModal from './src/components/AuthModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    justifyContent: 'space-between',
                },
                tabBarItemStyle: {
                    flex: 1,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    headerTitle: 'Дашборд',
                    tabBarLabel: ({ color }) => (
                        <TabLabel label="Дашборд" color={color} />
                    ),
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="📊" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TarotReaders"
                component={TarotReadersScreen}
                options={{
                    headerTitle: 'Tarot Readers',
                    tabBarLabel: ({ color }) => (
                        <TabLabel label="Tarot Readers" color={color} />
                    ),
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="🃏" color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

function AppContent() {
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const { user, signOut, hasProfileData, checkingProfile } = useAuth();

    const handleAuthAction = () => {
        if (user) {
            signOut();
        } else {
            setAuthModalVisible(true);
        }
    };

    return (
        <>
            <StatusBar style="light" />
            <NavigationContainer
                theme={{
                    ...DarkTheme,
                    colors: {
                        ...DarkTheme.colors,
                        primary: COLORS.primary,
                        background: COLORS.background,
                        card: COLORS.surface,
                        text: COLORS.text,
                        border: COLORS.border,
                        notification: COLORS.secondary,
                    },
                }}
            >
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {user && hasProfileData && !checkingProfile ? (
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                    ) : (
                        <Stack.Screen name="AuthGate" component={DashboardScreen} />
                    )}
                    <Stack.Screen name="Chat" component={ChatScreen} />
                </Stack.Navigator>
            </NavigationContainer>
            <AuthModal
                visible={authModalVisible}
                onClose={() => setAuthModalVisible(false)}
            />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

function TabLabel({ label, color }) {
    return (
        <Text style={{ fontSize: 12, color }}>
            {label}
        </Text>
    );
}

function TabIcon({ emoji, color }) {
    return (
        <Text style={{ fontSize: 24, opacity: color === COLORS.primary ? 1 : 0.5 }}>
            {emoji}
        </Text>
    );
}

const styles = StyleSheet.create({
    loginButton: {
        marginRight: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
