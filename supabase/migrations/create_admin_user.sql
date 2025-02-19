-- First, ensure the user exists in auth.users
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID if they exist
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'adminsub@gmail.com';

    -- Update the user to admin role
    UPDATE profiles
    SET role = 'admin'
    WHERE id = user_id;

    -- If no rows were updated, the user might not exist in profiles
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        INSERT INTO profiles (id, role)
        VALUES (user_id, 'admin');
    END IF;
END $$; 