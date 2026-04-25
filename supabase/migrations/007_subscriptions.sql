-- Add Stripe subscription fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'business')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));