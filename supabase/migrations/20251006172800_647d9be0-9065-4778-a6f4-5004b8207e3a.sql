-- Step 1: Add 'super_admin' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Step 2: Add church_id to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE;