-- Update package structure with new pricing and features
-- This migration adds new fields and replaces existing packages with the new structure

-- First, add the new fields to the ad_packages table
ALTER TABLE ad_packages 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'one_time',
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false;

-- Add check constraints for the new fields (drop first if they exist)
ALTER TABLE ad_packages 
DROP CONSTRAINT IF EXISTS ad_packages_plan_type_check;

ALTER TABLE ad_packages 
ADD CONSTRAINT ad_packages_plan_type_check 
CHECK (plan_type IN ('one_time', 'subscription'));

ALTER TABLE ad_packages 
DROP CONSTRAINT IF EXISTS ad_packages_billing_cycle_check;

ALTER TABLE ad_packages 
ADD CONSTRAINT ad_packages_billing_cycle_check 
CHECK (billing_cycle IN ('one_time', 'monthly', 'yearly'));

-- First, deactivate all existing packages
UPDATE ad_packages SET active = false, updated_at = NOW();

-- Insert new One-Time Packages
INSERT INTO ad_packages (
  id, name, price, duration, features, best_for, color, icon, 
  recommended, popular, ads_allowed, active, plan_type, billing_cycle, is_subscription
) VALUES 
-- Free Package
(
  'free',
  'Free',
  0,
  '7 days',
  ARRAY[
    '5 ads maximum',
    'Basic listing placement',
    'Standard search visibility',
    'Email support',
    'Basic analytics (views only)'
  ],
  'New users testing the platform',
  'border-gray-400',
  'Gift',
  false,
  false,
  5,
  true,
  'one_time',
  'one_time',
  false
),

-- Quick Boost
(
  'quick_boost',
  'Quick Boost',
  10,
  '14 days',
  ARRAY[
    '1 ad',
    'Priority placement (appears before free ads)',
    'Enhanced visibility in search results',
    'Basic analytics (views + clicks)',
    'Email support',
    'Featured badge'
  ],
  'Quick sales or testing premium features',
  'border-blue-400',
  'Zap',
  false,
  true,
  1,
  true,
  'one_time',
  'one_time',
  false
),

-- Power Listing
(
  'power_listing',
  'Power Listing',
  50,
  '30 days',
  ARRAY[
    '5 ads',
    'Top search ranking',
    'Featured in category sections',
    'Advanced analytics (views, clicks, engagement)',
    'Priority support',
    'Boosted badge',
    'Social media sharing tools'
  ],
  'Serious sellers wanting maximum visibility',
  'border-purple-400',
  'TrendingUp',
  true,
  false,
  5,
  true,
  'one_time',
  'one_time',
  false
),

-- Mega Campaign
(
  'mega_campaign',
  'Mega Campaign',
  150,
  '60 days',
  ARRAY[
    '20 ads',
    'Premium search ranking',
    'Homepage featured section',
    'Complete analytics dashboard',
    'Phone support',
    'Premium badge',
    'Auto-renewal option',
    'Performance insights'
  ],
  'High-value items or business launches',
  'border-green-400',
  'Shield',
  false,
  false,
  20,
  true,
  'one_time',
  'one_time',
  false
),

-- Insert new Subscription Packages
-- Starter Monthly
(
  'starter_monthly',
  'Starter Monthly',
  60,
  '1 month',
  ARRAY[
    '10 ads',
    'Standard priority placement',
    'Basic analytics',
    'Email support',
    'Verified badge',
    'Auto-renewal',
    '10% discount on one-time packages'
  ],
  'Regular sellers with consistent inventory',
  'border-blue-500',
  'Star',
  false,
  false,
  10,
  true,
  'subscription',
  'monthly',
  true
),

-- Professional Monthly
(
  'professional_monthly',
  'Professional Monthly',
  120,
  '1 month',
  ARRAY[
    '25 ads',
    'Enhanced search ranking',
    'Advanced analytics dashboard',
    'Priority support',
    'Professional badge',
    'Social media integration',
    '15% discount on one-time packages',
    'Performance reports'
  ],
  'Active sellers building their brand',
  'border-purple-500',
  'TrendingUp',
  true,
  true,
  25,
  true,
  'subscription',
  'monthly',
  true
),

-- Business Monthly
(
  'business_monthly',
  'Business Monthly',
  250,
  '1 month',
  ARRAY[
    '50 ads',
    'Premium search ranking',
    'Complete analytics suite',
    'Phone + email support',
    'Business badge',
    'Custom storefront',
    '20% discount on one-time packages',
    'Marketing tools',
    'Customer insights'
  ],
  'Established businesses with high volume',
  'border-green-500',
  'Shield',
  false,
  false,
  50,
  true,
  'subscription',
  'monthly',
  true
),

-- Enterprise Monthly
(
  'enterprise_monthly',
  'Enterprise Monthly',
  500,
  '1 month',
  ARRAY[
    'Unlimited ads',
    'Top-tier search ranking',
    'Advanced analytics + AI insights',
    'Dedicated account manager',
    'Enterprise badge',
    'Custom branding',
    '25% discount on one-time packages',
    'API access',
    'White-label options'
  ],
  'Large businesses and agencies',
  'border-red-500',
  'Crown',
  false,
  false,
  null, -- null means unlimited
  true,
  'subscription',
  'monthly',
  true
);

-- Update package features for the new packages
-- Clear existing package features
DELETE FROM package_features;

-- Insert package features for new packages
INSERT INTO package_features (package_id, feature_name, feature_value) VALUES
-- Free Package Features
('free', 'priority_placement', '{"enabled": false, "boost": 0}'),
('free', 'analytics', '{"enabled": true, "level": "basic"}'),
('free', 'featured_listing', '{"enabled": false}'),
('free', 'urgent_tag', '{"enabled": false, "count": 0}'),
('free', 'verification_badge', '{"enabled": false}'),
('free', 'auto_renewal', '{"enabled": false}'),
('free', 'support_level', '{"type": "email"}'),

-- Quick Boost Features
('quick_boost', 'priority_placement', '{"enabled": true, "boost": 1}'),
('quick_boost', 'analytics', '{"enabled": true, "level": "basic"}'),
('quick_boost', 'featured_listing', '{"enabled": true}'),
('quick_boost', 'urgent_tag', '{"enabled": false, "count": 0}'),
('quick_boost', 'verification_badge', '{"enabled": true, "type": "featured"}'),
('quick_boost', 'auto_renewal', '{"enabled": false}'),
('quick_boost', 'support_level', '{"type": "email"}'),

-- Power Listing Features
('power_listing', 'priority_placement', '{"enabled": true, "boost": 3}'),
('power_listing', 'analytics', '{"enabled": true, "level": "advanced"}'),
('power_listing', 'featured_listing', '{"enabled": true}'),
('power_listing', 'urgent_tag', '{"enabled": false, "count": 0}'),
('power_listing', 'verification_badge', '{"enabled": true, "type": "boosted"}'),
('power_listing', 'auto_renewal', '{"enabled": true}'),
('power_listing', 'support_level', '{"type": "priority"}'),

-- Mega Campaign Features
('mega_campaign', 'priority_placement', '{"enabled": true, "boost": 5}'),
('mega_campaign', 'analytics', '{"enabled": true, "level": "complete"}'),
('mega_campaign', 'featured_listing', '{"enabled": true, "homepage": true}'),
('mega_campaign', 'urgent_tag', '{"enabled": false, "count": 0}'),
('mega_campaign', 'verification_badge', '{"enabled": true, "type": "premium"}'),
('mega_campaign', 'auto_renewal', '{"enabled": true}'),
('mega_campaign', 'support_level', '{"type": "phone"}'),

-- Starter Monthly Features
('starter_monthly', 'priority_placement', '{"enabled": true, "boost": 1}'),
('starter_monthly', 'analytics', '{"enabled": true, "level": "basic"}'),
('starter_monthly', 'featured_listing', '{"enabled": false}'),
('starter_monthly', 'urgent_tag', '{"enabled": false, "count": 0}'),
('starter_monthly', 'verification_badge', '{"enabled": true, "type": "verified"}'),
('starter_monthly', 'auto_renewal', '{"enabled": true}'),
('starter_monthly', 'support_level', '{"type": "email"}'),
('starter_monthly', 'discount_onetime', '{"enabled": true, "percentage": 10}'),

-- Professional Monthly Features
('professional_monthly', 'priority_placement', '{"enabled": true, "boost": 2}'),
('professional_monthly', 'analytics', '{"enabled": true, "level": "advanced"}'),
('professional_monthly', 'featured_listing', '{"enabled": true}'),
('professional_monthly', 'urgent_tag', '{"enabled": false, "count": 0}'),
('professional_monthly', 'verification_badge', '{"enabled": true, "type": "professional"}'),
('professional_monthly', 'auto_renewal', '{"enabled": true}'),
('professional_monthly', 'support_level', '{"type": "priority"}'),
('professional_monthly', 'discount_onetime', '{"enabled": true, "percentage": 15}'),

-- Business Monthly Features
('business_monthly', 'priority_placement', '{"enabled": true, "boost": 4}'),
('business_monthly', 'analytics', '{"enabled": true, "level": "complete"}'),
('business_monthly', 'featured_listing', '{"enabled": true}'),
('business_monthly', 'urgent_tag', '{"enabled": false, "count": 0}'),
('business_monthly', 'verification_badge', '{"enabled": true, "type": "business"}'),
('business_monthly', 'auto_renewal', '{"enabled": true}'),
('business_monthly', 'support_level', '{"type": "phone"}'),
('business_monthly', 'discount_onetime', '{"enabled": true, "percentage": 20}'),
('business_monthly', 'custom_storefront', '{"enabled": true}'),

-- Enterprise Monthly Features
('enterprise_monthly', 'priority_placement', '{"enabled": true, "boost": 5}'),
('enterprise_monthly', 'analytics', '{"enabled": true, "level": "ai_insights"}'),
('enterprise_monthly', 'featured_listing', '{"enabled": true, "homepage": true}'),
('enterprise_monthly', 'urgent_tag', '{"enabled": false, "count": 0}'),
('enterprise_monthly', 'verification_badge', '{"enabled": true, "type": "enterprise"}'),
('enterprise_monthly', 'auto_renewal', '{"enabled": true}'),
('enterprise_monthly', 'support_level', '{"type": "dedicated"}'),
('enterprise_monthly', 'discount_onetime', '{"enabled": true, "percentage": 25}'),
('enterprise_monthly', 'custom_storefront', '{"enabled": true}'),
('enterprise_monthly', 'api_access', '{"enabled": true}'),
('enterprise_monthly', 'white_label', '{"enabled": true}');

-- Add comments for documentation
COMMENT ON TABLE ad_packages IS 'Updated package structure with 4 one-time and 4 subscription packages';
COMMENT ON COLUMN ad_packages.plan_type IS 'Type of plan: one-time or subscription';
COMMENT ON COLUMN ad_packages.billing_cycle IS 'Billing cycle: one-time, monthly, etc.';
COMMENT ON COLUMN ad_packages.is_subscription IS 'Boolean flag indicating if this is a subscription package';
