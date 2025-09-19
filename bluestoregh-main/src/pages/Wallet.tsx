
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const WalletPage = () => {
  const { user } = useAuth();
  const { wallet, transactions, loading, error } = useWallet();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading wallet...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="md:hidden -m-4 mb-4">
          <MobileHeader />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading wallet data</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const balance = wallet?.balance || 0;
  const pendingBalance = wallet?.pending_balance || 0;

  return (
    <Layout>
      <div className="md:hidden -m-4 mb-4">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Wallet className="h-8 w-8 mr-3 text-blue-600" />
            My Wallet
          </h1>
          <p className="text-gray-600 mt-1">Manage your earnings and transactions</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-4">
                GHS {balance.toFixed(2)}
              </div>
              <div className="flex space-x-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Money
                </Button>
                <Button variant="outline" className="flex-1">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-4">
                GHS {pendingBalance.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">
                Funds from recent sales that are being processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Methods
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/26</p>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === "incoming" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {transaction.type === "incoming" ? (
                        <ArrowDownLeft className={`h-4 w-4 ${
                          transaction.type === "incoming" ? "text-green-600" : "text-red-600"
                        }`} />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === "incoming" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "incoming" ? "+" : ""}
                      GHS {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === "pending" ? "text-orange-500" : "text-gray-500" 
                    }`}>
                      {transaction.status === "pending" ? "Processing" : "Completed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WalletPage;
