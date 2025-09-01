# Coming Soon Features

This folder contains features that are planned for future releases but are not included in the current MVP.

## Storefront Features

The following storefront-related features have been moved here:

### Pages
- `Storefront.tsx` - Main storefront page
- `StorefrontSearch.tsx` - Storefront search functionality
- `StorefrontProductDetail.tsx` - Storefront product detail page
- `StorefrontChat.tsx` - Storefront chat functionality
- `StorefrontManager.tsx` - Storefront management page

### Components
- `StorefrontCustomizer.tsx` - Storefront customization component

### Services
- `storefrontService.ts` - Storefront service layer

## Why These Were Moved

These features were moved to focus on shipping the core MVP functionality first. Storefront features add complexity and can be added in future iterations after the basic marketplace functionality is stable.

## To Re-enable Storefront Features

1. Move the files back to their original locations
2. Update the App.tsx routes
3. Re-enable storefront-related imports
4. Update the vendor types and services to include storefront fields

## Notes

- Storefront features are referenced in some other files (like vendor types and verification success page)
- These references should be cleaned up or commented out when re-enabling
- Consider implementing storefront features as a separate module in future releases

