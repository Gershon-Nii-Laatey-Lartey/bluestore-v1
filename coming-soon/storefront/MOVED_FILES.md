# Storefront Files Moved to Coming Soon

## Files Moved

### Pages
- `src/pages/Storefront.tsx` → `coming-soon/storefront/Storefront.tsx`
- `src/pages/StorefrontSearch.tsx` → `coming-soon/storefront/StorefrontSearch.tsx`
- `src/pages/StorefrontProductDetail.tsx` → `coming-soon/storefront/StorefrontProductDetail.tsx`
- `src/pages/StorefrontChat.tsx` → `coming-soon/storefront/StorefrontChat.tsx`
- `src/pages/StorefrontManager.tsx` → `coming-soon/storefront/StorefrontManager.tsx`

### Components
- `src/components/vendor/StorefrontCustomizer.tsx` → `coming-soon/storefront/StorefrontCustomizer.tsx`

### Services
- `src/services/storefrontService.ts` → `coming-soon/storefront/storefrontService.ts`

## Code Changes Made

### App.tsx
- Removed storefront page imports
- Removed storefront routes:
  - `/storefront/:url`
  - `/storefront/:url/search`
  - `/storefront/:url/product/:id`
  - `/storefront/:url/chat`
  - `/storefront-manager`

### Types
- `src/types/vendor.ts`: Removed `storefrontUrl` and `storefrontEnabled` fields

### Services
- `src/services/vendorService.ts`: Removed storefront-related fields from return objects

### Pages
- `src/pages/VerificationSuccess.tsx`: 
  - Removed storefront manager button
  - Removed storefront tip
  - Updated "What's next?" text

### Components
- `src/components/UserProfileMenu.tsx`:
  - Removed "Manage Storefront" link from user dropdown menu
  - Removed `hasStorefront` state and related logic
  - Cleaned up storefront package feature checking

### Package Features
- `src/types/adPackage.ts`: Removed "Storefront URL" feature from package descriptions

## What This Achieves

1. **Cleaner MVP**: Removes complex storefront functionality for faster shipping
2. **Reduced Bundle Size**: Smaller JavaScript bundle without storefront code
3. **Simplified Navigation**: Cleaner routing without storefront paths
4. **Focused Development**: Can focus on core marketplace features first

## To Re-enable Later

1. Move files back to original locations
2. Restore imports in App.tsx
3. Add back storefront routes
4. Restore storefront fields in vendor types
5. Re-enable storefront service
6. Update verification success page
7. Test all storefront functionality

## Notes

- Build still succeeds after removal
- No breaking changes to core functionality
- Storefront features are completely isolated in coming-soon folder
- Can be re-enabled incrementally in future releases
