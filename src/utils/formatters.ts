/**
 * Formats a price with proper comma separators for thousands
 * @param price - The price as a number or string
 * @param currency - The currency symbol (default: 'GHS')
 * @returns Formatted price string with commas
 */
export const formatPrice = (price: number | string, currency: string = 'GHS'): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return `${currency} 0.00`;
  }
  
  // Format with commas for thousands separators
  const formattedPrice = numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${currency} ${formattedPrice}`;
};

/**
 * Formats a price without currency symbol
 * @param price - The price as a number or string
 * @returns Formatted price string with commas but no currency
 */
export const formatPriceOnly = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
