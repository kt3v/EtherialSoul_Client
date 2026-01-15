-- Create user_profiles table for storing birth data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    birth_place TEXT,
    birth_latitude DOUBLE PRECISION,
    birth_longitude DOUBLE PRECISION,
    timezone TEXT,
    birth_date_time TIMESTAMPTZ,
    utc_offset TEXT,
    astrology_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Make policies idempotent for reruns
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create policy: Users can only read their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON user_profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
