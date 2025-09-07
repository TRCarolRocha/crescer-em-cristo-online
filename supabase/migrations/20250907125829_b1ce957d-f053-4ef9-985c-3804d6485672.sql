-- Add unique constraint to prevent duplicate group members
ALTER TABLE group_members ADD CONSTRAINT unique_user_group 
UNIQUE (user_id, group_id);