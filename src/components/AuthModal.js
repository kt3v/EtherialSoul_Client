import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ visible, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
                Alert.alert('Успех', 'Вы успешно вошли в систему');
            } else {
                await signUp(email, password);
                Alert.alert('Успех', 'Регистрация успешна! Проверьте email для подтверждения.');
            }
            setEmail('');
            setPassword('');
            onClose();
        } catch (error) {
            Alert.alert('Ошибка', error.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isLogin ? 'Вход' : 'Регистрация'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Пароль</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={COLORS.textSecondary}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={toggleMode}
                            disabled={loading}
                        >
                            <Text style={styles.toggleButtonText}>
                                {isLogin
                                    ? 'Нет аккаунта? Зарегистрируйтесь'
                                    : 'Уже есть аккаунт? Войдите'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: COLORS.textSecondary,
    },
    form: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    toggleButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    toggleButtonText: {
        fontSize: 14,
        color: COLORS.secondary,
    },
});
