-- Add policy for admins to remove group members
CREATE POLICY "Admins can remove group members"
ON group_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);