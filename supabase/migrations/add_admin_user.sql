-- Get the user ID for adminsub@gmail.com
DO $$ 
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'adminsub@gmail.com';

    -- Insert admin role into profiles
    INSERT INTO profiles (id, role)
    VALUES (user_id, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET role = 'admin';

    -- Only update email_confirmed_at as confirmed_at is a generated column
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = user_id;
END $$;