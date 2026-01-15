-- Add astrology_data column to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS astrology_data JSONB;
