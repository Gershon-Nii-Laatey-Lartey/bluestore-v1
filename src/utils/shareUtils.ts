/**
 * Utility functions for sharing content using the Web Share API
 */

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Check if the Web Share API is supported in the current browser
 */
export const isWebShareSupported = (): boolean => {
  return 'share' in navigator;
};

/**
 * Share content using the Web Share API
 * @param data - The data to share
 * @param onSuccess - Callback when sharing is successful
 * @param onError - Callback when sharing fails
 * @returns Promise<boolean> - true if sharing was successful, false otherwise
 */
export const shareContent = async (
  data: ShareData,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  if (!isWebShareSupported()) {
    const error = new Error('Web Share API is not supported in this browser');
    onError?.(error);
    return false;
  }

  try {
    await navigator.share(data);
    onSuccess?.();
    return true;
  } catch (error) {
    // User cancelled sharing or error occurred
    if (error instanceof Error && error.name !== 'AbortError') {
      onError?.(error);
    }
    return false;
  }
};

/**
 * Share a product with default text formatting
 * @param productTitle - The title of the product
 * @param productUrl - The URL of the product
 * @param onSuccess - Callback when sharing is successful
 * @param onError - Callback when sharing fails
 */
export const shareProduct = async (
  productTitle: string,
  productUrl: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  return shareContent(
    {
      title: productTitle,
      text: `Check out this product: ${productTitle}`,
      url: productUrl,
    },
    onSuccess,
    onError
  );
};

/**
 * Share a storefront with default text formatting
 * @param storefrontName - The name of the storefront
 * @param storefrontUrl - The URL of the storefront
 * @param onSuccess - Callback when sharing is successful
 * @param onError - Callback when sharing fails
 */
export const shareStorefront = async (
  storefrontName: string,
  storefrontUrl: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  return shareContent(
    {
      title: storefrontName,
      text: `Check out this store: ${storefrontName}`,
      url: storefrontUrl,
    },
    onSuccess,
    onError
  );
};

/**
 * Share a profile with default text formatting
 * @param profileName - The name of the profile
 * @param profileUrl - The URL of the profile
 * @param onSuccess - Callback when sharing is successful
 * @param onError - Callback when sharing fails
 */
export const shareProfile = async (
  profileName: string,
  profileUrl: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  return shareContent(
    {
      title: profileName,
      text: `Check out this profile: ${profileName}`,
      url: profileUrl,
    },
    onSuccess,
    onError
  );
};
