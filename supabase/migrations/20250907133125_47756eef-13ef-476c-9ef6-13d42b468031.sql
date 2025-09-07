-- Add policy for admins to manage group members
CREATE POLICY "Admins can manage group members"
ON group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);