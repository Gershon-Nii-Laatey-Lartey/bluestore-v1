
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Calendar,
  Lightbulb,
  Star,
  TrendingUp,
  Shield,
  Gift,
  Zap,
  Package
} from "lucide-react";
import { ProductSubmission } from "@/services/dataService";
import { DocumentImage } from "./DocumentImage";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { formatPrice } from "@/utils/formatters";
import { ProductDetailModal } from "./ProductDetailModal";
import { ProductSuggestionModal } from "./ProductSuggestionModal";

interface ProductReviewTabProps {
  pendingSubmissions: ProductSubmission[];
  approvedProducts: ProductSubmission[];
  rejectedProducts: ProductSubmission[];
  totalSubmissions: number;
  onApproval: (submissionId: string, approved: boolean, rejectionReason?: string, suggestions?: string) => void;
}

export const ProductReviewTab = ({ 
  pendingSubmissions, 
  approvedProducts, 
  rejectedProducts, 
  totalSubmissions,
  onApproval 
}: ProductReviewTabProps) => {
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedProductForSuggestion, setSelectedProductForSuggestion] = useState<ProductSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'package'>('none');

  const handleSuggestionSubmit = async (suggestion: string) => {
    if (!selectedProductForSuggestion) return;
    
    setIsSubmitting(true);
    await onApproval(selectedProductForSuggestion.id, true, undefined, suggestion);
    setIsSubmitting(false);
    setSuggestionModalOpen(false);
    setSelectedProductForSuggestion(null);
  };

  const handleSkipSuggestion = async () => {
    if (!selectedProductForSuggestion) return;
    
    setIsSubmitting(true);
    await onApproval(selectedProductForSuggestion.id, true);
    setIsSubmitting(false);
    setSuggestionModalOpen(false);
    setSelectedProductForSuggestion(null);
  };

  const handleSuggestAndApprove = (product: ProductSubmission) => {
    setSelectedProductForSuggestion(product);
    setSuggestionModalOpen(true);
  };

  const getPackageIcon = (packageId?: string) => {
    switch (packageId) {
      case 'pro':
      case 'business':
      case 'premium':
        return Shield;
      default:
        return Star;
    }
  };

  const getPackageColor = (packageId?: string) => {
    switch (packageId) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'rising':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'business':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      case 'premium':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const groupedSubmissions = groupBy === 'package' 
    ? pendingSubmissions.reduce((groups, submission) => {
        const packageId = submission.package?.id || 'no-package';
        if (!groups[packageId]) {
          groups[packageId] = [];
        }
        groups[packageId].push(submission);
        return groups;
      }, {} as Record<string, ProductSubmission[]>)
    : { 'all': pendingSubmissions };

  const renderProductCard = (submission: ProductSubmission) => {
    const packageInfo = submission.package;
    const PackageIcon = getPackageIcon(packageInfo?.id);

    return (
      <div key={submission.id} className="border border-border rounded-xl p-4 sm:p-6 hover:shadow-sm transition-shadow bg-card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image Section */}
          <div className="w-full sm:w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
            {submission.images && submission.images.length > 0 ? (
              <DocumentImage 
                src={getMainImageWithFallback(submission.images, submission.main_image_index)} 
                alt={submission.title} 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <div className="text-2xl">📱</div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{submission.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
                  <span className="capitalize font-medium truncate">{submission.category}</span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="capitalize truncate">{submission.condition}</span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span className="flex items-center space-x-1 truncate">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700 text-xs">
                    Pending Review
                  </Badge>
                  {packageInfo && (
                    <Badge variant="outline" className={`flex items-center gap-1 ${getPackageColor(packageInfo.id)} text-xs truncate max-w-[200px]`}>
                      <PackageIcon className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{packageInfo.name} - {formatPrice(packageInfo.price)}</span>
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(submission.price)}</p>
                {submission.originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">{formatPrice(submission.originalPrice)}</p>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2 text-sm">{submission.description}</p>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-border gap-3">
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="font-medium">Location:</span> 
                <span className="truncate max-w-[150px]">{submission.location}</span>
                {submission.negotiable && (
                  <Badge variant="outline" className="text-xs">Negotiable</Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <ProductDetailModal product={submission} onApproval={onApproval} />
                </Dialog>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                  onClick={() => onApproval(submission.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quick Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 w-full sm:w-auto"
                  onClick={() => handleSuggestAndApprove(submission)}
                  disabled={isSubmitting}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggest & Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Approval Progress */}
      {totalSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Product Approval Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Products Processed</span>
                <span>{approvedProducts.length + rejectedProducts.length} of {totalSubmissions}</span>
              </div>
              <Progress 
                value={(approvedProducts.length + rejectedProducts.length) / totalSubmissions * 100} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{approvedProducts.length} Approved</span>
                <span className="text-red-600">{rejectedProducts.length} Rejected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingSubmissions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Pending Product Approvals</span>
                <Badge variant="secondary">{pendingSubmissions.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={groupBy} onValueChange={(value: 'none' | 'package') => setGroupBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    <SelectItem value="package">Group by package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(([groupKey, submissions]) => (
                <div key={groupKey}>
                  {groupBy === 'package' && groupKey !== 'all' && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`${getPackageColor(groupKey === 'no-package' ? undefined : groupKey)} text-sm font-medium`}>
                          {groupKey === 'no-package' ? 'No Package Selected' : submissions[0]?.package?.name || groupKey}
                        </Badge>
                        <span className="text-sm text-gray-500">({submissions.length} products)</span>
                      </div>
                      <Separator className="mb-4" />
                    </div>
                  )}
                  
                  {submissions.map((submission, index) => (
                    <div key={submission.id}>
                      {renderProductCard(submission)}
                      {index < submissions.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                  
                  {Object.keys(groupedSubmissions).length > 1 && groupKey !== Object.keys(groupedSubmissions)[Object.keys(groupedSubmissions).length - 1] && (
                    <Separator className="my-8 border-dashed" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Product Reviews</h3>
              <p className="text-gray-600">All product submissions have been processed.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestion Modal */}
      <Dialog open={suggestionModalOpen} onOpenChange={setSuggestionModalOpen}>
        {selectedProductForSuggestion && (
          <ProductSuggestionModal
            productTitle={selectedProductForSuggestion.title}
            onSuggestion={handleSuggestionSubmit}
            onSkip={handleSkipSuggestion}
            onCancel={() => {
              setSuggestionModalOpen(false);
              setSelectedProductForSuggestion(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Dialog>
    </div>
  );
};
