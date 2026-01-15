import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function TarotReadersScreen({ navigation }) {
    const readers = useMemo(
        () => [
            { id: 'reader-1', name: 'Алина', avatar: require('../../assets/avatars/avatar_1.jpg') },
            { id: 'reader-2', name: 'Марина', avatar: require('../../assets/avatars/avatar_2.jpg') },
            { id: 'reader-3', name: 'Богдан', avatar: require('../../assets/avatars/avatar_3.jpg') },
            { id: 'reader-4', name: 'Гордон', avatar: require('../../assets/avatars/avatar_4.jpg') },
            { id: 'reader-5', name: 'Лада', avatar: require('../../assets/avatars/avatar_5.jpg') },
        ],
        []
    );

    return (
        <LinearGradient colors={[COLORS.background, '#0a1a2e']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Tarot Readers</Text>
                <Text style={styles.subtitle}>Выберите таролога, чтобы начать чат</Text>
                <View style={styles.grid}>
                    {readers.map(reader => (
                        <TouchableOpacity
                            key={reader.id}
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate('Chat', {
                                    chatMode: 'tarot',
                                    readerName: reader.name,
                                })
                            }
                        >
                            <View style={styles.avatarContainer}>
                                <Image source={reader.avatar} style={styles.avatarImage} resizeMode="cover" />
                            </View>
                            <Text style={styles.name}>{reader.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 48,
    },
    title: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: 18,
        rowGap: 28,
    },
    card: {
        width: '30%',
    },
    avatarContainer: {
        width: '100%',
        aspectRatio: 784 / 1168,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    name: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
});
