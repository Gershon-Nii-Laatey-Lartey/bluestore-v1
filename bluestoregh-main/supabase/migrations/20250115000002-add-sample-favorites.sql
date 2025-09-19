-- Add sample favorites for testing the favorites functionality
-- This migration adds sample user favorites to test the favorites page

-- First, let's add some sample favorites for users
-- We'll create favorites for the first user (if they exist) with some of our sample products

INSERT INTO public.user_favorites (user_id, product_id)
SELECT 
  u.id as user_id,
  p.id as product_id
FROM auth.users u
CROSS JOIN public.products p
WHERE u.id IS NOT NULL 
  AND p.id IS NOT NULL
  -- Add some specific products as favorites (mix of different categories)
  AND p.title IN (
    'iPhone 15 Pro',
    'Samsung Galaxy S24', 
    'MacBook Pro M3',
    'Sony WH-1000XM5',
    'PlayStation 5',
    'Car Phone Mount',
    'Dash Camera',
    'Nike Air Max 270'
  )
  -- Only add favorites for the first user to avoid duplicates
  AND u.id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
  -- Ensure we don't create duplicate favorites
  AND NOT EXISTS (
    SELECT 1 FROM public.user_favorites uf 
    WHERE uf.user_id = u.id AND uf.product_id = p.id
  )
LIMIT 5; -- Limit to 5 favorites to keep it reasonable

-- Add a few more favorites for variety (if we have multiple users)
INSERT INTO public.user_favorites (user_id, product_id)
SELECT 
  u.id as user_id,
  p.id as product_id
FROM auth.users u
CROSS JOIN public.products p
WHERE u.id IS NOT NULL 
  AND p.id IS NOT NULL
  -- Add different products as favorites for the second user (if exists)
  AND p.title IN (
    'Car Air Freshener',
    'Bluetooth Adapter',
    'iPhone 15 Pro',
    'PlayStation 5'
  )
  -- Only add favorites for the second user (if they exist)
  AND u.id = (SELECT id FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1)
  -- Ensure we don't create duplicate favorites
  AND NOT EXISTS (
    SELECT 1 FROM public.user_favorites uf 
    WHERE uf.user_id = u.id AND uf.product_id = p.id
  )
LIMIT 3; -- Limit to 3 additional favorites

-- Note: This migration will only work if:
-- 1. There are users in the auth.users table
-- 2. There are products in the public.products table (from the previous migration)
-- 3. The user_favorites table exists

-- If no users exist yet, this migration will simply not insert any favorites
-- Users can add favorites manually through the app once they're registered
