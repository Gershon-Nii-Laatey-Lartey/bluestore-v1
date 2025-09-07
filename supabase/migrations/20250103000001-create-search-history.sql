-- Create search_history table for tracking user searches and analytics
CREATE TABLE public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  location TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policies for search_history
CREATE POLICY "Users can view their own search history" 
  ON public.search_history 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can create their own search history" 
  ON public.search_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Admin policy for analytics
CREATE POLICY "Admins can view all search history" 
  ON public.search_history 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Create index for better performance
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX idx_search_history_query ON public.search_history(search_query);

-- Add comments for documentation
COMMENT ON TABLE public.search_history IS 'Tracks user search queries and results for analytics';
COMMENT ON COLUMN public.search_history.search_query IS 'The search query entered by the user';
COMMENT ON COLUMN public.search_history.location IS 'User location when search was performed';
COMMENT ON COLUMN public.search_history.results_count IS 'Number of results returned for this search';

