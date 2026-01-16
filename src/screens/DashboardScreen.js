import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import UserDataModal from '../components/UserDataModal';
import { fetchDailyForecast } from '../services/dailyForecastService';

export default function DashboardScreen({ navigation }) {
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [userDataModalVisible, setUserDataModalVisible] = useState(false);
    const { user, signOut, hasProfileData, checkingProfile, checkProfileData, loading, profileReady } = useAuth();
    const [isOnboarding, setIsOnboarding] = useState(false);

    const [dailyForecast, setDailyForecast] = useState(null);
    const [dailyForecastTimestamp, setDailyForecastTimestamp] = useState(null);
    const [dailyForecastLoading, setDailyForecastLoading] = useState(false);
    const [dailyForecastError, setDailyForecastError] = useState(null);

    const categories = useMemo(
        () => [
            {
                key: 'vitality',
                title: '⚡ Витальность',
                items: [
                    { text: 'В чем мой главный врожденный источник сил и что меня обычно драйвит?', type: 'static' },
                    { text: 'Почему я чувствую упадок сил сегодня, несмотря на все планы?', type: 'transit' },
                    { text: 'Какой тип физической нагрузки больше всего подходит моему темпераменту?', type: 'static' },
                    { text: 'Какое время сегодня лучшее для интенсивной тренировки?', type: 'transit' },
                    { text: 'Склонна ли моя природа к выгоранию или я могу работать в долгую?', type: 'static' },
                ],
            },
            {
                key: 'focus',
                title: '🧠 Когнитивный фокус',
                items: [
                    { text: 'Как мой мозг лучше всего усваивает информацию: через логику или образы?', type: 'static' },
                    { text: 'Подходящее ли сейчас время для глубокого обучения или сдачи экзамена?', type: 'transit' },
                    { text: 'В каких сферах мне проще всего сохранять концентрацию на деталях?', type: 'static' },
                    { text: 'Почему мне так сложно сосредоточиться на работе именно в данный момент?', type: 'transit' },
                    { text: 'Стоит ли мне доверять своим решениям в спешке или мне нужно время на подумать?', type: 'static' },
                ],
            },
            {
                key: 'luck',
                title: '🍀 Везение',
                items: [
                    { text: 'В какой сфере жизни заложен мой самый большой потенциал для успеха?', type: 'static' },
                    { text: 'В какой области мне сегодня может улыбнуться неожиданная удача?', type: 'transit' },
                    { text: 'Что для меня выгоднее: холодный расчет или умение рискнуть в нужный момент?', type: 'static' },
                    { text: 'Благоприятен ли этот день для запуска рискованного эксперимента?', type: 'transit' },
                    { text: 'Какие качества притягивают ко мне возможности «подарки судьбы»?', type: 'static' },
                ],
            },
            {
                key: 'friction',
                title: '⛓️ Трение',
                items: [
                    { text: 'Какие типы препятствий чаще всего встречаются на моем пути и зачем они мне?', type: 'static' },
                    { text: 'Почему сегодня всё идет с такими задержками и внешним сопротивлением?', type: 'transit' },
                    { text: 'Какая стратегия поведения в конфликтах для меня самая экологичная?', type: 'static' },
                    { text: 'Стоит ли вступать в дискуссии прямо сейчас или лучше переждать пик трения?', type: 'transit' },
                    { text: 'Где мои самые слабые места, которые вызывают стресс и бюрократические сложности?', type: 'static' },
                ],
            },
            {
                key: 'magnetism',
                title: '💖 Магнетизм',
                items: [
                    { text: 'Какая черта моей личности больше всего притягивает ко мне других людей?', type: 'static' },
                    { text: 'Насколько я сегодня привлекателен для окружающих и новых знакомств?', type: 'transit' },
                    { text: 'Какая модель отношений для меня самая естественная и комфортная?', type: 'static' },
                    { text: 'Подходящий ли это вечер для первого свидания или важного разговора?', type: 'transit' },
                    { text: 'Как мне лучше всего проявлять свое влияние в переговорах, чтобы меня слышали?', type: 'static' },
                ],
            },
            {
                key: 'intuition',
                title: '👁️ Интуиция',
                items: [
                    { text: 'Насколько сильно у меня развито чутье от рождения и как оно проявляется?', type: 'static' },
                    { text: 'Стоит ли мне доверять своему предчувствию именно в текущем вопросе?', type: 'transit' },
                    { text: 'Какие внутренние блоки чаще всего мешают мне слышать свой голос?', type: 'static' },
                    { text: 'Подходит ли сегодняшнее время для медитации и поиска ответов внутри?', type: 'transit' },
                    { text: 'Склонна ли моя психика к накручиванию тревоги на пустом месте?', type: 'static' },
                ],
            },
        ],
        []
    );

    const [selectedCategoryKey, setSelectedCategoryKey] = useState(categories[0]?.key);
    const selectedCategory = useMemo(
        () => categories.find(c => c.key === selectedCategoryKey) ?? categories[0],
        [categories, selectedCategoryKey]
    );

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!profileReady) {
            return;
        }

        if (user && !checkingProfile) {
            if (!hasProfileData) {
                setIsOnboarding(true);
                setUserDataModalVisible(true);
            } else {
                setIsOnboarding(false);
            }
        }
    }, [user, hasProfileData, checkingProfile, loading, profileReady]);

    useEffect(() => {
        if (loading) return;
        if (!profileReady) return;
        if (!user) return;
        if (isOnboarding) return;

        let isCancelled = false;

        const loadDailyForecast = async () => {
            try {
                setDailyForecastLoading(true);
                setDailyForecastError(null);

                const result = await fetchDailyForecast();

                if (isCancelled) return;

                setDailyForecast(result.forecast);
                setDailyForecastTimestamp(result.timestamp);
            } catch (error) {
                if (isCancelled) return;
                setDailyForecastError(error?.message || 'Failed to fetch daily forecast');
            } finally {
                if (isCancelled) return;
                setDailyForecastLoading(false);
            }
        };

        loadDailyForecast();

        return () => {
            isCancelled = true;
        };
    }, [loading, profileReady, user, isOnboarding]);

    useEffect(() => {
        if (loading) return;
        if (!profileReady) return;
        if (!user) return;

        if (hasProfileData && isOnboarding) {
            setIsOnboarding(false);
            setUserDataModalVisible(false);
        }
    }, [loading, profileReady, user, hasProfileData, isOnboarding]);

    const handleAuthAction = () => {
        if (user) {
            signOut();
        } else {
            setAuthModalVisible(true);
        }
    };

    const handleOnboardingComplete = async () => {
        await checkProfileData(user.id);
        setIsOnboarding(false);
        setUserDataModalVisible(false);
    };

    if (loading) {
        return (
            <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
                <View style={styles.centeredLoginContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Загрузка...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Render centered login view for unauthenticated users
    if (!user) {
        return (
            <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
                <View style={styles.centeredLoginContainer}>
                    <TouchableOpacity
                        style={styles.centeredLoginButton}
                        onPress={() => setAuthModalVisible(true)}
                    >
                        <Text style={styles.centeredLoginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
                <AuthModal
                    visible={authModalVisible}
                    onClose={() => setAuthModalVisible(false)}
                />
            </LinearGradient>
        );
    }

    // Render onboarding modal if user has no profile data
    if (user && isOnboarding) {
        return (
            <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
                <UserDataModal
                    visible={userDataModalVisible}
                    onClose={() => {}}
                    isOnboarding={true}
                    onComplete={handleOnboardingComplete}
                />
            </LinearGradient>
        );
    }

    // Render full dashboard for authenticated users
    return (
        <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userButton}
                    onPress={() => setUserDataModalVisible(true)}
                >
                    <Text style={styles.userButtonText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={signOut}
                >
                    <Text style={styles.logoutButtonText}>Выйти</Text>
                </TouchableOpacity>
            </View>
             <ScrollView contentContainerStyle={styles.content}>
                 <View style={styles.dailyForecastCard}>
                     <Text style={styles.dailyForecastDate}>
                         {new Date().toLocaleDateString('ru-RU', {
                             weekday: 'long',
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric',
                         })}
                     </Text>

                     {dailyForecastError ? (
                         <Text style={styles.dailyForecastErrorText}>{dailyForecastError}</Text>
                     ) : dailyForecast ? (
                         <Text style={styles.dailyForecastText}>{dailyForecast}</Text>
                     ) : dailyForecastLoading ? (
                         <View style={styles.dailyForecastLoadingRow}>
                             <ActivityIndicator size="small" color={COLORS.primary} />
                             <Text style={styles.dailyForecastLoadingText}>Загружаю напутствие...</Text>
                         </View>
                     ) : (
                         <Text style={styles.dailyForecastText}>{' '}</Text>
                     )}

                     {!!dailyForecastTimestamp && (
                         <Text style={styles.dailyForecastTimestamp}>
                             Обновлено: {new Date(dailyForecastTimestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                         </Text>
                     )}
                 </View>

                 <View style={styles.categoriesContainer}>
                     {categories.map(category => {
                         const isActive = category.key === selectedCategoryKey;
                        return (
                            <TouchableOpacity
                                key={category.key}
                                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                                onPress={() => setSelectedCategoryKey(category.key)}
                            >
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        isActive && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {category.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.itemsContainer}>
                    {(selectedCategory?.items ?? []).map(item => (
                        <TouchableOpacity
                            key={item.text}
                            style={styles.itemButton}
                            onPress={() => navigation.navigate('Chat', { 
                                chatMode: 'astro',
                                initialMessage: item.text,
                                questionType: item.type
                            })}
                        >
                            <Text style={styles.itemButtonText}>{item.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <UserDataModal
                visible={userDataModalVisible}
                onClose={() => setUserDataModalVisible(false)}
                isOnboarding={false}
                onComplete={handleOnboardingComplete}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredLoginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredLoginButton: {
        paddingHorizontal: 48,
        paddingVertical: 16,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    centeredLoginButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    loadingText: {
        color: COLORS.text,
        fontSize: 16,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    userButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        marginRight: 12,
    },
    userButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.error,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    dailyForecastCard: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
    },
    dailyForecastDate: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'capitalize',
    },
    dailyForecastText: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '500',
    },
    dailyForecastLoadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dailyForecastLoadingText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    dailyForecastErrorText: {
        color: COLORS.error,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    dailyForecastTimestamp: {
        marginTop: 10,
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    categoryChip: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    itemsContainer: {
        gap: 10,
    },
    itemButton: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 14,
    },
    itemButtonText: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
    },
});
