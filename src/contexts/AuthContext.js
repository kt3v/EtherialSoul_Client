import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import socketService from '../services/socket';
import astrologyDataManager from '../services/astrologyDataManager';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasProfileData, setHasProfileData] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userProfileLoading, setUserProfileLoading] = useState(false);
    const [userProfileLoadedAt, setUserProfileLoadedAt] = useState(null);
    const [profileReady, setProfileReady] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setProfileReady(false);
            
            if (session?.user) {
                await loadUserProfile({ userId: session.user.id });
                await checkProfileData(session.user.id);
                await loadAndGenerateTransitChart(session.user.id);
                setProfileReady(true);
            } else {
                setProfileReady(true);
            }
            
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setProfileReady(false);
            
            if (session?.user) {
                await loadUserProfile({ userId: session.user.id });
                await checkProfileData(session.user.id);
                await loadAndGenerateTransitChart(session.user.id);
                setProfileReady(true);
            } else {
                setHasProfileData(false);
                setUserProfile(null);
                setUserProfileLoadedAt(null);
                setProfileReady(true);
                astrologyDataManager.clear();
            }
            
            setLoading(false);
            
            if (socketService.socket) {
                await socketService.reconnect();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const loadUserProfile = async ({ userId, force = false } = {}) => {
        const targetUserId = userId ?? user?.id;
        if (!targetUserId) return null;

        if (!force && userProfile && userProfile.user_id === targetUserId) {
            return userProfile;
        }

        setUserProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', targetUserId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            setUserProfile(data ?? null);
            setUserProfileLoadedAt(new Date().toISOString());
            return data ?? null;
        } finally {
            setUserProfileLoading(false);
        }
    };

    const saveUserBirthData = async (birthData) => {
        if (!user) throw new Error('User not authenticated');
        
        const upsertPayload = {
            user_id: user.id,
            full_name: birthData.fullName,
            birth_place: birthData.birthPlace,
            birth_latitude: birthData.coordinates.latitude,
            birth_longitude: birthData.coordinates.longitude,
            timezone: birthData.timezone,
            birth_date_time: birthData.birthDateTime,
            utc_offset: birthData.utcOffset,
            astrology_data: birthData.astrologyData || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(upsertPayload, {
                onConflict: 'user_id'
            });
        
        if (error) throw error;

        setUserProfile((prev) => {
            if (prev && prev.user_id === user.id) {
                return { ...prev, ...upsertPayload };
            }
            return { ...upsertPayload };
        });
        setUserProfileLoadedAt(new Date().toISOString());

        return data;
    };

    const getUserBirthData = async () => {
        if (!user) return null;

        if (userProfile && userProfile.user_id === user.id) {
            return userProfile;
        }

        return loadUserProfile({ userId: user.id });
    };

    const loadAndGenerateTransitChart = async (userId) => {
        try {
            const data = (userProfile && userProfile.user_id === userId)
                ? userProfile
                : await loadUserProfile({ userId });

            if (data && data.birth_latitude && data.birth_longitude && data.astrology_data) {
                console.log('[AuthContext] Loading natal chart from database');
                astrologyDataManager.setNatalChart(data.astrology_data);
                
                console.log('[AuthContext] Generating transit chart');
                astrologyDataManager.generateTransitChart(
                    data.birth_place,
                    data.birth_latitude,
                    data.birth_longitude,
                    data.timezone
                );
            }
        } catch (error) {
            console.error('[AuthContext] Error in loadAndGenerateTransitChart:', error);
        }
    };

    const checkProfileData = async (userId) => {
        setCheckingProfile(true);
        try {
            const profile = (userProfile && userProfile.user_id === userId)
                ? userProfile
                : await loadUserProfile({ userId });

            const hasData = !!(profile?.full_name && profile?.birth_date_time);
            setHasProfileData(hasData);
            return hasData;
        } catch (error) {
            console.error('Error checking profile data:', error);
            setHasProfileData(false);
            return false;
        } finally {
            setCheckingProfile(false);
            setProfileReady(true);
        }
    };

    const value = {
        user,
        session,
        loading,
        hasProfileData,
        checkingProfile,
        userProfile,
        userProfileLoading,
        userProfileLoadedAt,
        profileReady,
        signUp,
        signIn,
        signOut,
        saveUserBirthData,
        getUserBirthData,
        loadUserProfile,
        checkProfileData,
        loadAndGenerateTransitChart,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
