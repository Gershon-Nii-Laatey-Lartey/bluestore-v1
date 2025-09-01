/**
 * Get the main image from a product's images array
 * @param images - Array of image URLs
 * @param mainImageIndex - Index of the main image (defaults to 0)
 * @returns The main image URL or a placeholder if no images exist
 */
export const getMainImage = (images: string[], mainImageIndex: number = 0): string => {
  if (!images || images.length === 0) {
    return '/placeholder.svg'; // Return placeholder if no images
  }
  
  // Ensure mainImageIndex is within bounds
  const validIndex = Math.max(0, Math.min(mainImageIndex, images.length - 1));
  return images[validIndex];
};

/**
 * Get the main image with fallback to first image if main_image_index is not set
 * @param images - Array of image URLs
 * @param mainImageIndex - Index of the main image (can be undefined)
 * @returns The main image URL or a placeholder if no images exist
 */
export const getMainImageWithFallback = (images: string[], mainImageIndex?: number): string => {
  if (!images || images.length === 0) {
    return '/placeholder.svg'; // Return placeholder if no images
  }
  
  // Use mainImageIndex if provided and valid, otherwise use 0
  const index = (mainImageIndex !== undefined && mainImageIndex >= 0 && mainImageIndex < images.length) 
    ? mainImageIndex 
    : 0;
  

  
  return images[index];
};

