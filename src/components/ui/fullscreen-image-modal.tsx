import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  images?: string[];
  currentIndex?: number;
  onImageChange?: (index: number) => void;
}

export const FullscreenImageModal = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  images = [],
  currentIndex = 0,
  onImageChange
}: FullscreenImageModalProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset transformations when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isTransitioning) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (images.length > 1 && onImageChange) {
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
            handleImageChange(prevIndex);
          }
          break;
        case 'ArrowRight':
          if (images.length > 1 && onImageChange) {
            const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
            handleImageChange(nextIndex);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          setScale(prev => Math.min(prev * 1.2, 5));
          break;
        case '-':
          e.preventDefault();
          setScale(prev => Math.max(prev / 1.2, 0.1));
          break;
        case '0':
          setScale(1);
          setRotation(0);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentIndex, onImageChange, onClose, isTransitioning]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageChange = (newIndex: number) => {
    if (isTransitioning || !onImageChange) return;
    
    setIsTransitioning(true);
    
    // Trigger the image change
    onImageChange(newIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) {
      // If zoomed in, handle panning
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else {
      // If not zoomed in, handle swipe navigation
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scale > 1) {
      // Handle panning when zoomed in
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - touchStart.x,
        y: touch.clientY - touchStart.y
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale <= 1 && images.length > 1 && onImageChange && !isTransitioning) {
      // Handle swipe navigation when not zoomed in
      const touch = e.changedTouches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
      
      const diffX = touchStart.x - touch.clientX;
      const diffY = touchStart.y - touch.clientY;
      
      // Check if it's a horizontal swipe (more horizontal than vertical)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - next image
          const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
          handleImageChange(nextIndex);
        } else {
          // Swipe right - previous image
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
          handleImageChange(prevIndex);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Background overlay - solid black on mobile, transparent on desktop */}
      <div 
        className="absolute inset-0 bg-black md:bg-black/80 backdrop-blur-sm transition-all duration-300 ease-in-out z-10"
        onClick={onClose}
      />
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-200"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation arrows - visible on all devices */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onImageChange) {
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                handleImageChange(prevIndex);
              }
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[10000] bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-200"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onImageChange) {
                const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                handleImageChange(nextIndex);
              }
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[10000] bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-200"
            disabled={isTransitioning}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-[10000] bg-white/20 text-white px-3 py-1 rounded text-sm shadow-lg backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Controls - hidden on mobile for cleaner experience */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] flex items-center space-x-2 bg-white/20 rounded-lg p-2 shadow-lg backdrop-blur-sm hidden md:flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="text-white hover:bg-white/20 border-0 transition-all duration-200"
          disabled={scale <= 0.1}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-white hover:bg-white/20 border-0 transition-all duration-200"
        >
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="text-white hover:bg-white/20 border-0 transition-all duration-200"
          disabled={scale >= 5}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          className="text-white hover:bg-white/20 border-0 transition-all duration-200"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Image container with fade transition */}
      <div
        ref={containerRef}
        className="relative z-[10001] flex items-center justify-center transition-opacity duration-300 ease-in-out pointer-events-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          opacity: isTransitioning ? 0.7 : 1
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-w-[90vw] max-h-[80vh] object-contain transition-all duration-300 ease-in-out pointer-events-auto"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
            cursor: scale > 1 ? 'grab' : 'default'
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};
