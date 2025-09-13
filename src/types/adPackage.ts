
import { Star, TrendingUp, Shield, Gift, Zap } from "lucide-react";

export interface AdPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  bestFor: string;
  color: string;
  icon: React.ComponentType<any>;
  recommended?: boolean;
  popular?: boolean;
  adsAllowed?: number | null; // null means unlimited
  plan_type?: string; // 'one_time' or 'subscription'
  billing_cycle?: string; // 'monthly', 'yearly', etc.
  is_subscription?: boolean;
}

// Note: This hardcoded array is deprecated. 
// Use packageService.getPackages() to get packages from the database instead.
// This is kept for backward compatibility only.
export const adPackages: AdPackage[] = [
  {
    id: "free",
    name: "Free Package",
    price: 0,
    duration: "7 Days",
    features: [
      "5 Ads maximum",
      "Basic placement",
      "Email support",
      "7 days duration per ad"
    ],
    bestFor: "Testing the platform or occasional sellers",
    color: "border-gray-400",
    icon: Gift,
    adsAllowed: 5
  }
];
