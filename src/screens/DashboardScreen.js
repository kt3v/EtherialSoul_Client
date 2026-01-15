import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import UserDataModal from '../components/UserDataModal';

export default function DashboardScreen({ navigation }) {
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [userDataModalVisible, setUserDataModalVisible] = useState(false);
    const { user, signOut, hasProfileData, checkingProfile, checkProfileData } = useAuth();
    const [isOnboarding, setIsOnboarding] = useState(false);

    const categories = useMemo(
        () => [
            {
                key: 'vitality',
                title: '⚡ Витальность',
                items: [
                    'Почему я чувствую упадок сил, несмотря на планы?',
                    'Какое время сегодня лучшее для интенсивной тренировки?',
                    'Стоит ли мне сегодня браться за новый сложный проект?',
                    'Как мне экологично поднять уровень энергии прямо сейчас?',
                    'Будет ли завтра больше сил для активных действий?',
                ],
            },
            {
                key: 'focus',
                title: '🧠 Когнитивный фокус',
                items: [
                    'Подходящее ли сейчас время для глубокого обучения или экзамена?',
                    'Почему мне так сложно сосредоточиться на деталях в данный момент?',
                    'Стоит ли подписывать важный контракт или лучше подождать?',
                    'В какие часы мой мозг будет работать на пике продуктивности?',
                    'Как мне лучше структурировать задачи на сегодня, исходя из фокуса?',
                ],
            },
            {
                key: 'luck',
                title: '🍀 Везение',
                items: [
                    'В какой сфере мне сегодня может улыбнуться удача?',
                    'Благоприятен ли день для запуска рискованного эксперимента?',
                    'Ожидаются ли сегодня неожиданные приятные предложения?',
                    'Как мне не упустить возможность, которую дает текущий фон?',
                    'Стоит ли сегодня полагаться на случай или лучше все просчитать?',
                ],
            },
            {
                key: 'friction',
                title: '⛓️ Трение',
                items: [
                    'Почему сегодня всё идет с задержками и сопротивлением?',
                    'Как мне снизить уровень стресса от внешних препятствий?',
                    'Стоит ли вступать в дискуссии или лучше переждать пик трения?',
                    'В чем причина сегодняшних бюрократических или технических сложностей?',
                    'Какая стратегия поможет мне пройти через этот день с минимальными потерями?',
                ],
            },
            {
                key: 'magnetism',
                title: '💖 Магнетизм',
                items: [
                    'Насколько я сегодня привлекателен для окружающих?',
                    'Подходящий ли это вечер для первого свидания или знакомства?',
                    'Как мне усилить свое влияние на партнеров в переговорах сегодня?',
                    'Будет ли общение с близкими сегодня гармоничным или напряженным?',
                    'Как мне использовать свое обаяние для решения рабочих вопросов?',
                ],
            },
            {
                key: 'intuition',
                title: '👁️ Интуиция',
                items: [
                    'Стоит ли мне доверять своему предчувствию в текущем вопросе?',
                    'Что может означать мой сегодняшний яркий сон в контексте дня?',
                    'Как мне лучше настроиться на свой внутренний голос сегодня?',
                    'Почему я чувствую необъяснимую тревогу, есть ли для нее повод?',
                    'Подходит ли время для медитации и поиска ответов внутри себя?',
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
        if (user && !checkingProfile) {
            if (!hasProfileData) {
                setIsOnboarding(true);
                setUserDataModalVisible(true);
            } else {
                setIsOnboarding(false);
            }
        }
    }, [user, hasProfileData, checkingProfile]);

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

    // Show loading while checking profile
    if (user && checkingProfile) {
        return (
            <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
                <View style={styles.centeredLoginContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Загрузка профиля...</Text>
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
                    style={styles.chatButton}
                    onPress={() => navigation.navigate('Chat', { chatMode: 'tarot' })}
                >
                    <Text style={styles.chatButtonText}>Tarot reader chat</Text>
                </TouchableOpacity>
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
                            key={item}
                            style={styles.itemButton}
                            onPress={() => navigation.navigate('Chat', { 
                                chatMode: 'astro',
                                initialMessage: item 
                            })}
                        >
                            <Text style={styles.itemButtonText}>{item}</Text>
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
    chatButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 'auto',
    },
    chatButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
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
