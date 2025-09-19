
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

export const CategoriesSection = () => {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Categories</h3>
        <Link to="/search">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all →
          </Button>
        </Link>
      </div>
      
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
        {/* All Categories Button */}
        <Link to="/search">
          <Button
            variant="default"
            className="whitespace-nowrap rounded-full bg-blue-600 hover:bg-blue-700"
          >
            All
          </Button>
        </Link>
        
        {/* Dynamic Categories */}
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ))
        ) : (
          categories.map((category) => {
            // Create slug from category name
            const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return (
              <Link key={category.id} to={`/category/${slug}`}>
                <Button
                  variant="outline"
                  className="whitespace-nowrap rounded-full border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  {category.name}
                </Button>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};
