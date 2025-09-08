-- Fix foreign key constraint in group_members table
-- First, drop the existing foreign key constraint (if any)
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

-- Add the correct foreign key constraint pointing to member_groups
ALTER TABLE group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES member_groups(id) ON DELETE CASCADE;

-- Clean up any orphaned data if exists
DELETE FROM group_members 
WHERE group_id NOT IN (SELECT id FROM member_groups);

-- Also ensure we have proper RLS policies for group_members
-- Update the existing policy to be more specific
DROP POLICY IF EXISTS "Admins can manage group members" ON group_members;
DROP POLICY IF EXISTS "Admins can remove group members" ON group_members;

-- Create comprehensive policies for group_members
CREATE POLICY "Admins can insert group members" 
ON group_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete group members" 
ON group_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can join groups themselves" 
ON group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups themselves" 
ON group_members 
FOR DELETE 
USING (auth.uid() = user_id);