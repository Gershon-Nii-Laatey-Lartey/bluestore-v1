
import { packageService } from "./packageService";
import { adPackages } from "@/types/adPackage";

// Flag to prevent multiple seeding attempts
let isSeeding = false;

export const seedDefaultPackages = async () => {
  // Prevent multiple simultaneous seeding attempts
  if (isSeeding) {
    console.log('Package seeding already in progress, skipping...');
    return;
  }
  
  isSeeding = true;
  try {
    console.log('Starting package seeding...');
    
    // Get existing packages to avoid duplicates
    const existing = await packageService.getPackages();
    console.log(`Found ${existing.length} existing packages`);
    const existingIds = existing.map(pkg => pkg.id);
    
    // Filter out packages that already exist
    const packagesToSeed = adPackages.filter(pkg => !existingIds.includes(pkg.id));
    
    if (packagesToSeed.length === 0) {
      console.log('All default packages already exist, skipping seeding');
      return;
    }
    
    console.log(`Seeding ${packagesToSeed.length} new packages...`);
    
    // Seed missing packages with better error handling
    for (const pkg of packagesToSeed) {
      try {
        const iconName = pkg.icon.name || 'Star'; // Get icon name from component
        await packageService.createPackage({
          ...pkg,
          icon: iconName
        });
        console.log(`Successfully created package: ${pkg.name}`);
      } catch (createError: any) {
        // If it's a duplicate key error, just log and continue
        if (createError.code === '23505') {
          console.log(`Package ${pkg.name} already exists, skipping...`);
          continue;
        }
        // For other errors, re-throw
        throw createError;
      }
    }
    
    console.log(`Package seeding completed successfully`);
  } catch (error) {
    console.error('Error seeding packages:', error);
    // Don't throw the error to prevent breaking the admin page
    // The packages might already exist, which is fine
  } finally {
    isSeeding = false;
  }
};
