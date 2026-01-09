import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { COLORS } from './src/config';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <>
            <StatusBar style="light" />
            <NavigationContainer
                theme={{
                    dark: true,
                    colors: {
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
                            tabBarLabel: ({ color }) => (
                                <TabLabel label="Чат" color={color} />
                            ),
                            tabBarIcon: ({ color }) => (
                                <TabIcon emoji="💬" color={color} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </>
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
