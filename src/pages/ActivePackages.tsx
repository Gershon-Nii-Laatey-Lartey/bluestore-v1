
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { PaymentHistory } from "@/components/payment/PaymentHistory";
import { SubscriptionManager } from "@/components/payment/SubscriptionManager";

const ActivePackages = () => {
  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Sidebar */}
              <div className="col-span-3">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Subscriptions & Payments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Manage your active subscriptions and view payment history
                    </p>
                  </div>
                  
                  
                  {/* Quick Actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => window.location.href = '/publish-ad'}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        📝 Create New Ad
                      </button>
                      <button 
                        onClick={() => window.location.href = '/my-ads'}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        📦 Manage My Ads
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="col-span-9">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex justify-between items-center">
        <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Subscription Dashboard
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overview of your subscription plans and payment history
                      </p>
                    </div>
                  </div>
                  
                  {/* Subscription Manager */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Subscriptions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your current subscription plans</p>
                    </div>
                    <div className="p-6">
                      <SubscriptionManager />
                    </div>
                  </div>
                  
                  {/* Payment History */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment History</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your transaction history and invoices</p>
                    </div>
                    <div className="p-6">
                      <PaymentHistory />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Subscriptions & Payments
          </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your active subscriptions and view payment history
          </p>
        </div>

            <div className="space-y-6">
          <SubscriptionManager />
          <PaymentHistory />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivePackages;
