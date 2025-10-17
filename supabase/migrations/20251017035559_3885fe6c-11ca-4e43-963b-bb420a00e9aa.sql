-- Add plan_id column to pending_payments table to track specific plan chosen by user
ALTER TABLE public.pending_payments
ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);

-- Create index for better query performance
CREATE INDEX idx_pending_payments_plan_id ON public.pending_payments(plan_id);