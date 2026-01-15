import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import socketService from '../services/socket';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
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

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        saveUserBirthData,
        getUserBirthData,
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
