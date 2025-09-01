
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { FullscreenImageModal } from "@/components/ui/fullscreen-image-modal";

interface ProductImagesProps {
  images?: string[];
  title: string;
  mainImageIndex?: number;
}

export const ProductImages = ({ images, title, mainImageIndex }: ProductImagesProps) => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Initialize selectedImage with the main image index
  const [selectedImage, setSelectedImage] = useState(() => {
    if (!images || images.length === 0) return 0;
    // Use mainImageIndex if provided and valid, otherwise use 0
    return (mainImageIndex !== undefined && mainImageIndex >= 0 && mainImageIndex < images.length) 
      ? mainImageIndex 
      : 0;
  });
  
  // Update selected image when mainImageIndex or images change
  useEffect(() => {
    if (!images || images.length === 0) return;
    const validIndex = (mainImageIndex !== undefined && mainImageIndex >= 0 && mainImageIndex < images.length) 
      ? mainImageIndex 
      : 0;
    setSelectedImage(validIndex);
  }, [mainImageIndex, images]);

  const handlePrevious = () => {
    if (images && images.length > 0) {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  const handleNext = () => {
    if (images && images.length > 0) {
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleImageClick = () => {
    setFullscreenOpen(true);
  };

  const handleFullscreenImageChange = (index: number) => {
    setSelectedImage(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-8xl">
          📱
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Navigation */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <div 
          className="w-full h-full cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          onClick={handleImageClick}
        >
          <OptimizedImage
            src={images[selectedImage]}
            alt={title}
            aspectRatio="square"
            className="w-full h-full"
            fallback={
              <div className="text-8xl flex items-center justify-center h-full">📱</div>
            }
          />
        </div>
        
        {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 h-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 h-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter with Camera Icon */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>
              {(() => {
                // Calculate display index: main image should be "1", others relative to that
                const mainIdx = mainImageIndex || 0;
                if (selectedImage === mainIdx) {
                  return `1 / ${images.length}`;
                } else if (selectedImage < mainIdx) {
                  return `${selectedImage + 2} / ${images.length}`;
                } else {
                  return `${selectedImage + 1} / ${images.length}`;
                }
              })()}
            </span>
          </div>
        )}

        {/* Fullscreen indicator */}
        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Click to expand
        </div>
      </div>

      {/* Thumbnail Gallery - Horizontal scroll on mobile, grid on desktop */}
      {images.length > 1 && (
        <div className="relative">
          {/* Mobile: Horizontal scrollable thumbnails */}
          <div className="md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(() => {
                // Reorder images so main image appears first
                const mainIdx = mainImageIndex || 0;
                const reorderedImages = [
                  images[mainIdx], // Main image first
                  ...images.slice(0, mainIdx), // Images before main
                  ...images.slice(mainIdx + 1) // Images after main
                ];
                
                return reorderedImages.map((img, displayIndex) => {
                  // Calculate the original index for selection logic
                  let originalIndex;
                  if (displayIndex === 0) {
                    originalIndex = mainIdx; // Main image
                  } else if (displayIndex <= mainIdx) {
                    originalIndex = displayIndex - 1; // Images that were before main
                  } else {
                    originalIndex = displayIndex; // Images that were after main
                  }
                  
                  return (
                    <div 
                      key={originalIndex} 
                      className={`flex-shrink-0 aspect-square w-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedImage === originalIndex 
                          ? 'ring-2 ring-blue-500 ring-offset-1' 
                          : 'hover:opacity-80'
                      }`}
                      onClick={() => handleThumbnailClick(originalIndex)}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`${title} - ${displayIndex + 1}`}
                        aspectRatio="square"
                        className="w-full h-full"
                        fallback={
                          <div className="text-lg flex items-center justify-center h-full">📱</div>
                        }
                      />
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Desktop: Grid layout with "more" overlay */}
          <div className="hidden md:grid md:grid-cols-4 gap-2">
            {(() => {
              // Reorder images so main image appears first
              const mainIdx = mainImageIndex || 0;
              const reorderedImages = [
                images[mainIdx], // Main image first
                ...images.slice(0, mainIdx), // Images before main
                ...images.slice(mainIdx + 1) // Images after main
              ];
              
              return reorderedImages.slice(0, 4).map((img, displayIndex) => {
                // Calculate the original index for selection logic
                let originalIndex;
                if (displayIndex === 0) {
                  originalIndex = mainIdx; // Main image
                } else if (displayIndex <= mainIdx) {
                  originalIndex = displayIndex - 1; // Images that were before main
                } else {
                  originalIndex = displayIndex; // Images that were after main
                }
                
                return (
                  <div 
                    key={originalIndex} 
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                      selectedImage === originalIndex 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'hover:opacity-80'
                    }`}
                    onClick={() => handleThumbnailClick(originalIndex)}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${title} - ${displayIndex + 1}`}
                      aspectRatio="square"
                      className="w-full h-full"
                      fallback={
                        <div className="text-2xl flex items-center justify-center h-full">📱</div>
                      }
                    />
                    
                    {/* "More" overlay on 4th thumbnail if there are more than 4 images */}
                    {displayIndex === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-sm">
                        +{images.length - 4} more
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      <FullscreenImageModal
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        imageSrc={images[selectedImage]}
        imageAlt={`${title} - ${(() => {
          const mainIdx = mainImageIndex || 0;
          if (selectedImage === mainIdx) return '1 (Main)';
          if (selectedImage < mainIdx) return `${selectedImage + 2}`;
          return `${selectedImage + 1}`;
        })()}`}
        images={images}
        currentIndex={selectedImage}
        onImageChange={handleFullscreenImageChange}
      />
    </div>
  );
};
