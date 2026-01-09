import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config';

export default function DashboardScreen({ navigation }) {
    return (
        <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.iconGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.iconText}>📊</Text>
                    </LinearGradient>
                </View>

                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>
                    Здесь будет отображаться информация,{'\n'}
                    визуализация и графика
                </Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Сообщений</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Диалогов</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buttonText}>Перейти в чат</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 60,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 48,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 48,
    },
    statCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 24,
        minWidth: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    button: {
        width: '100%',
        maxWidth: 300,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 28,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
