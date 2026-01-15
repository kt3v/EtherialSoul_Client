import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    FlatList,
    Platform,
} from 'react-native';
import { COLORS } from '../theme';
import { DateTime } from 'luxon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { calculateCelestialBodies } from '../services/astrologyService';
import astrologyDataManager from '../services/astrologyDataManager';

export default function UserDataModal({ visible, onClose, isOnboarding = false, onComplete }) {
    const { user, saveUserBirthData, getUserBirthData, userProfile } = useAuth();
    const [step, setStep] = useState('form');
    const [fullName, setFullName] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [results, setResults] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateValue, setDateValue] = useState(new Date());
    const [timeValue, setTimeValue] = useState(new Date());
    const suppressNextFetch = useRef(false);
    const isSelectingSuggestion = useRef(false);

    useEffect(() => {
        if (visible && user) {
            loadExistingData();
        }
    }, [visible, user]);

    useEffect(() => {
        if (!visible) return;
        if (!user) return;
        if (!userProfile) return;

        const data = userProfile;
        setFullName(data.full_name || '');
        setBirthPlace(data.birth_place || '');
        setSelectedLocation(data.birth_latitude && data.birth_longitude ? {
            lat: data.birth_latitude,
            lon: data.birth_longitude,
            name: data.birth_place,
        } : null);

        if (data.birth_date_time) {
            const dt = DateTime.fromISO(data.birth_date_time);
            setBirthDate(dt.toFormat('yyyy-MM-dd'));
            setBirthTime(dt.toFormat('HH:mm'));
            setDateValue(dt.toJSDate());
            setTimeValue(dt.toJSDate());

            if (data.astrology_data) {
                astrologyDataManager.setNatalChart(data.astrology_data);
            }

            const resultsData = {
                fullName: data.full_name,
                birthPlace: data.birth_place,
                coordinates: {
                    latitude: data.birth_latitude,
                    longitude: data.birth_longitude,
                },
                timezone: data.timezone,
                birthDateTime: data.birth_date_time,
                utcOffset: data.utc_offset,
                localTime: dt.toFormat('yyyy-MM-dd HH:mm:ss'),
                astrologyData: data.astrology_data,
            };
            setResults(resultsData);
            setStep('results');
        }
    }, [visible, user, userProfile]);

    useEffect(() => {
        if (suppressNextFetch.current) {
            suppressNextFetch.current = false;
            return;
        }
        if (birthPlace.length > 2) {
            const timer = setTimeout(() => {
                fetchSuggestions(birthPlace);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [birthPlace]);

    const loadExistingData = async () => {
        if (userProfile && userProfile.user_id === user?.id) {
            return;
        }

        try {
            const data = await getUserBirthData();
            if (data) {
                console.log('[userdata] loaded existing data:', data);
                setFullName(data.full_name || '');
                setBirthPlace(data.birth_place || '');
                setSelectedLocation(data.birth_latitude && data.birth_longitude ? {
                    lat: data.birth_latitude,
                    lon: data.birth_longitude,
                    name: data.birth_place,
                } : null);
                
                if (data.birth_date_time) {
                    const dt = DateTime.fromISO(data.birth_date_time);
                    setBirthDate(dt.toFormat('yyyy-MM-dd'));
                    setBirthTime(dt.toFormat('HH:mm'));
                    setDateValue(dt.toJSDate());
                    setTimeValue(dt.toJSDate());
                    
                    if (data.astrology_data) {
                        console.log('[userdata] loading natal chart from existing data');
                        astrologyDataManager.setNatalChart(data.astrology_data);
                    }
                    
                    const resultsData = {
                        fullName: data.full_name,
                        birthPlace: data.birth_place,
                        coordinates: {
                            latitude: data.birth_latitude,
                            longitude: data.birth_longitude,
                        },
                        timezone: data.timezone,
                        birthDateTime: data.birth_date_time,
                        utcOffset: data.utc_offset,
                        localTime: dt.toFormat('yyyy-MM-dd HH:mm:ss'),
                        astrologyData: data.astrology_data,
                    };
                    setResults(resultsData);
                    setStep('results');
                }
            }
        } catch (error) {
            console.error('[userdata] error loading existing data:', error);
        }
    };

    const fetchSuggestions = async (query) => {
        setLoadingSuggestions(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                {
                    headers: {
                        'User-Agent': 'EtherialSoul/1.0',
                    },
                }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSelectLocation = (location) => {
        suppressNextFetch.current = true;
        isSelectingSuggestion.current = false;
        setBirthPlace(location.display_name);
        setSelectedLocation({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            name: location.display_name,
        });
        setSuggestions([]);
    };

    const fetchTimezone = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.wheretheiss.at/v1/coordinates/${lat},${lon}`
            );
            const data = await response.json();
            console.log('[timezone] wheretheiss response', { 
                lat, 
                lon, 
                data,
                timezone_id: data.timezone_id
            });
            
            if (data.timezone_id) {
                return data.timezone_id;
            }
            
            console.warn('[timezone] No timezone_id in response, trying fallback...');
            
            const fallbackResponse = await fetch(
                `https://worldtimeapi.org/api/timezone`
            );
            const timezones = await fallbackResponse.json();
            console.log('[timezone] Available timezones count:', timezones.length);
            
            const estimatedTz = estimateTimezoneFromCoordinates(lat, lon);
            console.log('[timezone] Estimated timezone:', estimatedTz);
            return estimatedTz;
            
        } catch (error) {
            console.error('[timezone] fetch error', { lat, lon, error: error.message });
            const estimatedTz = estimateTimezoneFromCoordinates(lat, lon);
            console.log('[timezone] Using estimated timezone:', estimatedTz);
            return estimatedTz;
        }
    };

    const estimateTimezoneFromCoordinates = (lat, lon) => {
        const offsetHours = Math.round(lon / 15);
        
        if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
            return 'Europe/Moscow';
        } else if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -65) {
            return 'America/New_York';
        } else if (lat >= 30 && lat <= 45 && lon >= 100 && lon <= 145) {
            return 'Asia/Tokyo';
        } else if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
            return 'Australia/Sydney';
        }
        
        if (offsetHours >= -12 && offsetHours <= 14) {
            return `Etc/GMT${offsetHours <= 0 ? '+' : '-'}${Math.abs(offsetHours)}`;
        }
        
        return 'UTC';
    };

    const handleDateChange = (event, selectedDate) => {
        if (event?.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        const date = selectedDate || dateValue;
        setDateValue(date);
        setBirthDate(DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'));
        setShowDatePicker(false);
    };

    const handleTimeChange = (event, selectedTime) => {
        if (event?.type === 'dismissed') {
            setShowTimePicker(false);
            return;
        }
        const time = selectedTime || timeValue;
        setTimeValue(time);
        setBirthTime(DateTime.fromJSDate(time).toFormat('HH:mm'));
        setShowTimePicker(false);
    };

    const handleSubmit = async () => {
        if (!fullName.trim() || !selectedLocation || !birthDate.trim() || !birthTime.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        console.log('[userdata] input', {
            fullName,
            birthPlace,
            birthDate,
            birthTime,
            selectedLocation,
        });

        setCalculating(true);
        try {
            const { lat, lon } = selectedLocation;

            const timezoneName = await fetchTimezone(lat, lon);
            console.log('[userdata] fetched timezone:', timezoneName);

            const dateTimeString = `${birthDate}T${birthTime}`;
            console.log('[userdata] creating DateTime with:', { dateTimeString, zone: timezoneName });
            
            const birthDateTime = DateTime.fromISO(dateTimeString, { zone: timezoneName });
            console.log('[userdata] DateTime created:', {
                isValid: birthDateTime.isValid,
                invalidReason: birthDateTime.invalidReason,
                zoneName: birthDateTime.zoneName,
                offset: birthDateTime.offset,
                offsetMinutes: birthDateTime.offset,
                offsetHours: birthDateTime.offset / 60,
            });

            const utcOffset = birthDateTime.offset / 60;
            const offsetString = utcOffset >= 0 ? `+${utcOffset}` : `${utcOffset}`;

            console.log('[userdata] computed', {
                timezoneName,
                dateTimeString,
                birthDateTime: birthDateTime.toISO(),
                birthDateTimeLocal: birthDateTime.toString(),
                utcOffset: offsetString,
                isValid: birthDateTime.isValid,
                invalidReason: birthDateTime.invalidReason,
            });

            let astrologyData = null;
            try {
                console.log('[userdata] calculating natal chart...');
                astrologyData = calculateCelestialBodies(
                    birthDateTime.toISO(),
                    lat,
                    lon
                );
                console.log('[userdata] natal chart calculated:', astrologyData);
                
                astrologyDataManager.setNatalChart(astrologyData);
                
                console.log('[userdata] generating transit chart...');
                astrologyDataManager.generateTransitChart(
                    selectedLocation.name,
                    lat,
                    lon,
                    timezoneName
                );
            } catch (astrologyError) {
                console.error('[userdata] astrology calculation error:', astrologyError);
            }

            const resultsData = {
                fullName,
                birthPlace: selectedLocation.name,
                coordinates: {
                    latitude: lat,
                    longitude: lon,
                },
                timezone: timezoneName,
                birthDateTime: birthDateTime.toISO(),
                utcOffset: offsetString,
                localTime: birthDateTime.toFormat('yyyy-MM-dd HH:mm:ss'),
                astrologyData: astrologyData,
            };

            setResults(resultsData);

            if (user) {
                try {
                    console.log('[userdata] saving to Supabase...');
                    await saveUserBirthData(resultsData);
                    console.log('[userdata] successfully saved to Supabase');
                    console.log('[userdata] natal and transit charts stored in memory');
                    
                    // If in onboarding mode, call onComplete and skip results view
                    if (isOnboarding && onComplete) {
                        console.log('[userdata] onboarding complete, calling onComplete');
                        onComplete();
                        return;
                    }
                } catch (saveError) {
                    console.error('[userdata] error saving to Supabase:', saveError);
                    alert('Данные рассчитаны, но не удалось сохранить в базу данных');
                }
            } else {
                console.warn('[userdata] user not authenticated, skipping save');
            }

            setStep('results');
        } catch (error) {
            console.error('Error calculating data:', error);
            alert('Ошибка при обработке данных');
        } finally {
            setCalculating(false);
        }
    };

    const handleReset = () => {
        setStep('form');
        setFullName('');
        setBirthPlace('');
        setBirthDate('');
        setBirthTime('');
        setSuggestions([]);
        setSelectedLocation(null);
        setResults(null);
        setShowDatePicker(false);
        setShowTimePicker(false);
        setDateValue(new Date());
        setTimeValue(new Date());
    };

    const handleClose = () => {
        // Prevent closing in onboarding mode
        if (isOnboarding) {
            return;
        }
        handleReset();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isOnboarding ? 'Добро пожаловать! Введите ваши данные' : (step === 'form' ? 'Данные пользователя' : 'Результаты')}
                        </Text>
                        {!isOnboarding && (
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView style={styles.content} keyboardShouldPersistTaps="always" nestedScrollEnabled>
                        {step === 'form' ? (
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Полное имя</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        onFocus={() => setSuggestions([])}
                                        placeholder="Иван Иванов"
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Место рождения</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={birthPlace}
                                        onChangeText={(text) => {
                                            setBirthPlace(text);
                                            setSelectedLocation(null);
                                        }}
                                        placeholder="Начните вводить город..."
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                    {loadingSuggestions && (
                                        <ActivityIndicator
                                            style={styles.loader}
                                            color={COLORS.primary}
                                        />
                                    )}
                                    {suggestions.length > 0 && (
                                        <View style={styles.suggestionsContainer}>
                                            <FlatList
                                                data={suggestions}
                                                keyExtractor={(item) => item.place_id.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.suggestionItem}
                                                        onPressIn={() => {
                                                            isSelectingSuggestion.current = true;
                                                        }}
                                                        onPress={() => handleSelectLocation(item)}
                                                    >
                                                        <Text style={styles.suggestionText}>
                                                            {item.display_name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                                keyboardShouldPersistTaps="always"
                                                nestedScrollEnabled
                                            />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Дата рождения</Text>
                                    {Platform.OS === 'web' ? (
                                        <TextInput
                                            style={styles.input}
                                            value={birthDate}
                                            onChangeText={setBirthDate}
                                            onFocus={() => setSuggestions([])}
                                            placeholder="ГГГГ-ММ-ДД (например, 1990-01-15)"
                                            placeholderTextColor={COLORS.textSecondary}
                                            type="date"
                                        />
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    setSuggestions([]);
                                                    setShowDatePicker(true);
                                                }}
                                            >
                                                <View style={styles.input}>
                                                    <Text
                                                        style={birthDate ? styles.inputValue : styles.placeholderText}
                                                    >
                                                        {birthDate || 'ГГГГ-ММ-ДД (например, 1990-01-15)'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={dateValue}
                                                    mode="date"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={handleDateChange}
                                                />
                                            )}
                                        </>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Время рождения</Text>
                                    {Platform.OS === 'web' ? (
                                        <TextInput
                                            style={styles.input}
                                            value={birthTime}
                                            onChangeText={setBirthTime}
                                            onFocus={() => setSuggestions([])}
                                            placeholder="ЧЧ:ММ (например, 14:30)"
                                            placeholderTextColor={COLORS.textSecondary}
                                            type="time"
                                        />
                                    ) : (
                                        <>
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    setSuggestions([]);
                                                    setShowTimePicker(true);
                                                }}
                                            >
                                                <View style={styles.input}>
                                                    <Text
                                                        style={birthTime ? styles.inputValue : styles.placeholderText}
                                                    >
                                                        {birthTime || 'ЧЧ:ММ (например, 14:30)'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            {showTimePicker && (
                                                <DateTimePicker
                                                    value={timeValue}
                                                    mode="time"
                                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                    onChange={handleTimeChange}
                                                />
                                            )}
                                        </>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, calculating && styles.submitButtonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={calculating}
                                >
                                    {calculating ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Подтвердить</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.resultsContainer}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Полное имя:</Text>
                                    <Text style={styles.resultValue}>{results?.fullName}</Text>
                                </View>

                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Место рождения:</Text>
                                    <Text style={styles.resultValue}>{results?.birthPlace}</Text>
                                </View>

                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Координаты:</Text>
                                    <Text style={styles.resultValue}>
                                        Широта: {results?.coordinates.latitude.toFixed(6)}
                                    </Text>
                                    <Text style={styles.resultValue}>
                                        Долгота: {results?.coordinates.longitude.toFixed(6)}
                                    </Text>
                                </View>

                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Таймзона:</Text>
                                    <Text style={styles.resultValue}>{results?.timezone}</Text>
                                </View>

                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Время рождения (локальное):</Text>
                                    <Text style={styles.resultValue}>{results?.localTime}</Text>
                                </View>

                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Смещение UTC:</Text>
                                    <Text style={styles.resultValue}>UTC{results?.utcOffset} часов</Text>
                                </View>

                                {results?.astrologyData && (
                                    <View style={styles.astrologySection}>
                                        <Text style={styles.astrologySectionTitle}>Астрологические данные</Text>
                                        
                                        <View style={styles.astrologyGroup}>
                                            <Text style={styles.astrologyGroupTitle}>Основные точки</Text>
                                            <Text style={styles.astrologyItem}>
                                                ☉ Солнце: {results.astrologyData.sun?.sign} {results.astrologyData.sun?.degree?.toFixed(2)}°
                                                {results.astrologyData.sun?.house && ` (${results.astrologyData.sun.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ☽ Луна: {results.astrologyData.moon?.sign} {results.astrologyData.moon?.degree?.toFixed(2)}°
                                                {results.astrologyData.moon?.house && ` (${results.astrologyData.moon.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ↑ Асцендент: {results.astrologyData.ascendant?.sign} {results.astrologyData.ascendant?.degree?.toFixed(2)}°
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                MC Середина неба: {results.astrologyData.midheaven?.sign} {results.astrologyData.midheaven?.degree?.toFixed(2)}°
                                            </Text>
                                        </View>

                                        <View style={styles.astrologyGroup}>
                                            <Text style={styles.astrologyGroupTitle}>Личные планеты</Text>
                                            <Text style={styles.astrologyItem}>
                                                ☿ Меркурий: {results.astrologyData.mercury?.sign} {results.astrologyData.mercury?.degree?.toFixed(2)}°
                                                {results.astrologyData.mercury?.isRetrograde && ' ℞'}
                                                {results.astrologyData.mercury?.house && ` (${results.astrologyData.mercury.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ♀ Венера: {results.astrologyData.venus?.sign} {results.astrologyData.venus?.degree?.toFixed(2)}°
                                                {results.astrologyData.venus?.isRetrograde && ' ℞'}
                                                {results.astrologyData.venus?.house && ` (${results.astrologyData.venus.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ♂ Марс: {results.astrologyData.mars?.sign} {results.astrologyData.mars?.degree?.toFixed(2)}°
                                                {results.astrologyData.mars?.isRetrograde && ' ℞'}
                                                {results.astrologyData.mars?.house && ` (${results.astrologyData.mars.house} дом)`}
                                            </Text>
                                        </View>

                                        <View style={styles.astrologyGroup}>
                                            <Text style={styles.astrologyGroupTitle}>Социальные планеты</Text>
                                            <Text style={styles.astrologyItem}>
                                                ♃ Юпитер: {results.astrologyData.jupiter?.sign} {results.astrologyData.jupiter?.degree?.toFixed(2)}°
                                                {results.astrologyData.jupiter?.isRetrograde && ' ℞'}
                                                {results.astrologyData.jupiter?.house && ` (${results.astrologyData.jupiter.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ♄ Сатурн: {results.astrologyData.saturn?.sign} {results.astrologyData.saturn?.degree?.toFixed(2)}°
                                                {results.astrologyData.saturn?.isRetrograde && ' ℞'}
                                                {results.astrologyData.saturn?.house && ` (${results.astrologyData.saturn.house} дом)`}
                                            </Text>
                                        </View>

                                        <View style={styles.astrologyGroup}>
                                            <Text style={styles.astrologyGroupTitle}>Высшие планеты</Text>
                                            <Text style={styles.astrologyItem}>
                                                ♅ Уран: {results.astrologyData.uranus?.sign} {results.astrologyData.uranus?.degree?.toFixed(2)}°
                                                {results.astrologyData.uranus?.isRetrograde && ' ℞'}
                                                {results.astrologyData.uranus?.house && ` (${results.astrologyData.uranus.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ♆ Нептун: {results.astrologyData.neptune?.sign} {results.astrologyData.neptune?.degree?.toFixed(2)}°
                                                {results.astrologyData.neptune?.isRetrograde && ' ℞'}
                                                {results.astrologyData.neptune?.house && ` (${results.astrologyData.neptune.house} дом)`}
                                            </Text>
                                            <Text style={styles.astrologyItem}>
                                                ♇ Плутон: {results.astrologyData.pluto?.sign} {results.astrologyData.pluto?.degree?.toFixed(2)}°
                                                {results.astrologyData.pluto?.isRetrograde && ' ℞'}
                                                {results.astrologyData.pluto?.house && ` (${results.astrologyData.pluto.house} дом)`}
                                            </Text>
                                        </View>

                                        {(results.astrologyData.northnode || results.astrologyData.southnode) && (
                                            <View style={styles.astrologyGroup}>
                                                <Text style={styles.astrologyGroupTitle}>Лунные узлы</Text>
                                                {results.astrologyData.northnode && (
                                                    <Text style={styles.astrologyItem}>
                                                        ☊ Северный узел: {results.astrologyData.northnode?.sign} {results.astrologyData.northnode?.degree?.toFixed(2)}°
                                                        {results.astrologyData.northnode?.house && ` (${results.astrologyData.northnode.house} дом)`}
                                                    </Text>
                                                )}
                                                {results.astrologyData.southnode && (
                                                    <Text style={styles.astrologyItem}>
                                                        ☋ Южный узел: {results.astrologyData.southnode?.sign} {results.astrologyData.southnode?.degree?.toFixed(2)}°
                                                        {results.astrologyData.southnode?.house && ` (${results.astrologyData.southnode.house} дом)`}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={handleReset}
                                >
                                    <Text style={styles.resetButtonText}>Ввести новые данные</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
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
        maxWidth: 500,
        maxHeight: '90%',
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
    content: {
        maxHeight: 600,
    },
    form: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
        position: 'relative',
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
    inputValue: {
        fontSize: 16,
        color: COLORS.text,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    loader: {
        position: 'absolute',
        right: 16,
        top: 45,
    },
    suggestionsContainer: {
        marginTop: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    suggestionText: {
        fontSize: 14,
        color: COLORS.text,
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
    resultsContainer: {
        padding: 24,
    },
    resultItem: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    resultValue: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
    },
    resetButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    astrologySection: {
        marginBottom: 20,
    },
    astrologySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    astrologyGroup: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    astrologyGroupTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 12,
    },
    astrologyItem: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 20,
    },
});
