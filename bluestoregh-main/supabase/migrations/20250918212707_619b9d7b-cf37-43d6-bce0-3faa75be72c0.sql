-- Create user types enum
CREATE TYPE public.user_type AS ENUM ('buyer', 'vendor', 'admin');

-- Create app roles enum  
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  state_province TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  user_type user_type NOT NULL DEFAULT 'buyer',
  phone TEXT,
  location_id UUID REFERENCES public.locations(id),
  bio TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create vendor_profiles table
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_logo_url TEXT,
  tax_id TEXT,
  bank_account_info JSONB,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  location_id UUID REFERENCES public.locations(id),
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  brand TEXT,
  model TEXT,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories JSONB DEFAULT '[]',
  preferred_locations JSONB DEFAULT '[]',
  price_range JSONB DEFAULT '{"min": 0, "max": 10000}',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('product', 'order', 'system', 'promotion')) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_wallet table
CREATE TABLE public.user_wallet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  pending_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, vendor_id, product_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_support_message BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'buyer')
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Insert default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Insert default wallet
  INSERT INTO public.user_wallet (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_wallet_updated_at
  BEFORE UPDATE ON public.user_wallet
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies

-- Categories policies (public read, admin write)
CREATE POLICY "Everyone can view categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Locations policies (public read, admin write)
CREATE POLICY "Everyone can view locations" 
ON public.locations FOR SELECT USING (true);

CREATE POLICY "Admins can manage locations" 
ON public.locations FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Vendor profiles policies
CREATE POLICY "Everyone can view vendor profiles" 
ON public.vendor_profiles FOR SELECT USING (true);

CREATE POLICY "Users can manage their own vendor profile" 
ON public.vendor_profiles FOR ALL 
USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Everyone can view available products" 
ON public.products FOR SELECT 
USING (is_available = true);

CREATE POLICY "Vendors can view their own products" 
ON public.products FOR SELECT 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = vendor_id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" 
ON public.user_favorites FOR ALL 
USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- User wallet policies
CREATE POLICY "Users can view their own wallet" 
ON public.user_wallet FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" 
ON public.user_wallet FOR UPDATE 
USING (auth.uid() = user_id);

-- Chat conversations policies
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can create conversations" 
ON public.chat_conversations FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

-- Chat messages policies
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id 
    AND (buyer_id = auth.uid() OR vendor_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = conversation_id 
    AND (buyer_id = auth.uid() OR vendor_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages FOR UPDATE 
USING (auth.uid() = sender_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('product-images', 'product-images', true),
  ('profile-avatars', 'profile-avatars', true),
  ('vendor-logos', 'vendor-logos', true),
  ('chat-attachments', 'chat-attachments', false);

-- Create storage policies

-- Product images policies
CREATE POLICY "Everyone can view product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile avatars policies
CREATE POLICY "Everyone can view profile avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Vendor logos policies
CREATE POLICY "Everyone can view vendor logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vendor-logos');

CREATE POLICY "Users can upload their own vendor logo" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own vendor logo" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own vendor logo" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'vendor-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Chat attachments policies
CREATE POLICY "Users can view chat attachments in their conversations" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'chat-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload chat attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert some sample data
INSERT INTO public.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Fashion', 'Clothing and accessories'),
  ('Gaming', 'Video games and gaming accessories'),
  ('Automotive', 'Car parts and accessories'),
  ('Home & Garden', 'Home improvement and garden items'),
  ('Sports', 'Sports equipment and accessories'),
  ('Smartphones', 'Mobile phones and accessories'),
  ('Laptops', 'Laptops and computer accessories'),
  ('Headphones', 'Audio equipment and headphones');

INSERT INTO public.locations (country, state_province, city) VALUES
  ('Nigeria', 'Lagos', 'Lagos'),
  ('Nigeria', 'Abuja', 'Abuja'),
  ('Nigeria', 'Kano', 'Kano'),
  ('Nigeria', 'Rivers', 'Port Harcourt'),
  ('Nigeria', 'Oyo', 'Ibadan');