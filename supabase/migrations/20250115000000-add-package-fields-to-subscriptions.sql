-- Add missing package-related fields to user_plan_subscriptions table
-- These fields are needed to properly track package information from ad_packages table

-- Add package_id column to link to ad_packages table
ALTER TABLE user_plan_subscriptions 
ADD COLUMN IF NOT EXISTS package_id TEXT;

-- Add billing_cycle column to track subscription billing cycle
ALTER TABLE user_plan_subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'one_time';

-- Add is_subscription column to distinguish between one-time and subscription packages
ALTER TABLE user_plan_subscriptions 
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;

-- Add foreign key constraint to link package_id to ad_packages table
ALTER TABLE user_plan_subscriptions 
ADD CONSTRAINT fk_user_plan_subscriptions_package_id 
FOREIGN KEY (package_id) REFERENCES ad_packages(id);

-- Add check constraint for billing_cycle
ALTER TABLE user_plan_subscriptions 
ADD CONSTRAINT check_billing_cycle 
CHECK (billing_cycle IN ('one_time', 'monthly', 'yearly'));

-- Add comments for documentation
COMMENT ON COLUMN user_plan_subscriptions.package_id IS 'Reference to the package in ad_packages table';
COMMENT ON COLUMN user_plan_subscriptions.billing_cycle IS 'Billing cycle: one_time, monthly, or yearly';
COMMENT ON COLUMN user_plan_subscriptions.is_subscription IS 'Boolean flag indicating if this is a subscription package';
