-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON settings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON settings;

-- Create new policies that check for admin role
CREATE POLICY "Enable read access for all users" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Enable update access for admin users" ON settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Enable insert access for admin users" ON settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    ); 