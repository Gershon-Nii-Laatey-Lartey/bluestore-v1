
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { MobileHeader } from "@/components/MobileHeader";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { optimizedProductService } from "@/services/optimizedProductService";
import { ProductSubmission } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { getMainImageWithFallback } from "@/utils/imageUtils";

const Index = () => {
  const { toast } = useToast();

  const { data: featuredProducts = [], isLoading: loading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => optimizedProductService.getFeaturedProducts(),
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

  // Structured data for homepage
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "BlueStore Ghana - Homepage",
    "description": "Ghana's premier online marketplace for buying and selling electronics, fashion, automotive parts, and more.",
    "url": "https://bluestoregh.web.app",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Products",
      "description": "Featured products on BlueStore Ghana",
      "numberOfItems": featuredProducts.length,
      "itemListElement": featuredProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": getMainImageWithFallback(product.images, product.main_image_index),
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "GHS"
          }
        }
      }))
    }
  };

  return (
    <>
      <SEOHead
        title="BlueStore - Ghana's Online Marketplace"
        description="Buy and sell smartphones, laptops, electronics, fashion, automotive parts, and more on Ghana's trusted online marketplace. Safe, secure, and reliable platform for Ghanaians."
        keywords="Ghana marketplace, online shopping Ghana, buy sell Ghana, electronics Ghana, smartphones Ghana, laptops Ghana, fashion Ghana, automotive Ghana, BlueStore"
        structuredData={homepageStructuredData}
      />
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
    </>
  );
};

export default Index;
