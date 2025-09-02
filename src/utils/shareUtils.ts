/**
 * Utility functions for sharing content using the Web Share API with fallbacks
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
  return 'share' in navigator && navigator.share !== undefined;
};

/**
 * Check if the current environment supports sharing
 */
export const canShare = (): boolean => {
  // Web Share API is primarily available on mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  
  return isMobile && isSecure && isWebShareSupported();
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Share content using the Web Share API with fallbacks
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
  // Try Web Share API first
  if (canShare()) {
    try {
      await navigator.share(data);
      onSuccess?.();
      return true;
    } catch (error) {
      // User cancelled sharing or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Web Share API error:', error);
      }
      // Fall through to fallback methods
    }
  }

  // Fallback: Copy URL to clipboard
  if (data.url) {
    const copied = await copyToClipboard(data.url);
    if (copied) {
      onSuccess?.();
      return true;
    }
  }

  // Fallback: Copy text to clipboard
  if (data.text) {
    const copied = await copyToClipboard(data.text);
    if (copied) {
      onSuccess?.();
      return true;
    }
  }

  // If all fallbacks fail
  const error = new Error('Sharing failed - no supported methods available');
  onError?.(error);
  return false;
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
