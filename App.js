import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { COLORS } from './src/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthModal from './src/components/AuthModal';

const Tab = createBottomTabNavigator();

function AppContent() {
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const { user, signOut } = useAuth();

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
                        name="Chat"
                        component={ChatScreen}
                        options={{
                            headerTitle: 'Чат',
                            tabBarButton: () => null,
                            tabBarStyle: { display: 'none' },
                        }}
                    />
                </Tab.Navigator>
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
