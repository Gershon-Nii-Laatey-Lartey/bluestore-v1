
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { MobileHeader } from "@/components/MobileHeader";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  const { data: featuredProducts = [], isLoading: loading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .eq('is_featured', true)
        .limit(8);

      if (error) throw error;
      return data || [];
    },
    staleTime: 10000, // Consider data fresh for 10 seconds
    cacheTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Handle errors in useEffect to avoid render-time side effects
  useEffect(() => {
    if (error) {
      console.error('Error loading featured products:', error);
      toast({
        title: "Error",
        description: "Failed to load featured products",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <Layout>
      {/* Mobile Header - only show on mobile */}
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6 w-full md:px-0 px-[9px]">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts products={featuredProducts} loading={loading} />
      </div>
    </Layout>
  );
};

export default Index;
