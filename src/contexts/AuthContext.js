import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import socketService from '../services/socket';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasProfileData, setHasProfileData] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
                await checkProfileData(session.user.id);
            }
            
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
                await checkProfileData(session.user.id);
            } else {
                setHasProfileData(false);
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

    const saveUserBirthData = async (birthData) => {
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
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
            }, {
                onConflict: 'user_id'
            });
        
        if (error) throw error;
        return data;
    };

    const getUserBirthData = async () => {
        if (!user) return null;
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data;
    };

    const checkProfileData = async (userId) => {
        setCheckingProfile(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('full_name, birth_date_time')
                .eq('user_id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error checking profile data:', error);
                setHasProfileData(false);
                return false;
            }
            
            const hasData = !!(data?.full_name && data?.birth_date_time);
            setHasProfileData(hasData);
            return hasData;
        } catch (error) {
            console.error('Error checking profile data:', error);
            setHasProfileData(false);
            return false;
        } finally {
            setCheckingProfile(false);
        }
    };

    const value = {
        user,
        session,
        loading,
        hasProfileData,
        checkingProfile,
        signUp,
        signIn,
        signOut,
        saveUserBirthData,
        getUserBirthData,
        checkProfileData,
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
