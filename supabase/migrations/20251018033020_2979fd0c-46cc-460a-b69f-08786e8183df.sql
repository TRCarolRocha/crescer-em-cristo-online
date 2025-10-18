-- Allow authenticated users to view subscription plans when they have an active subscription
CREATE POLICY "Subscribers can view their plan"
ON public.subscription_plans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.plan_id = subscription_plans.id
      AND s.status = 'active'
      AND (
        s.user_id = auth.uid() OR
        s.church_id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
      )
  )
);